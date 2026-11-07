# Entrega AIP — preparación de despliegue y evidencia

Fecha: 2026-11-04. Implementación local validada; **sin push ni despliegue**. No se verificó la versión desplegada ni se consultó producción.

## Incluido

- Referencia única ARS/kg, historial conservado, costos incompletos null y ficha de proveedor/insumo. ADMINFAB dispone de navegación para permisos ya existentes.
- PDF/Word de orden desde una fuente común: identificación real de fórmula, porción, nutrición, fibra/otros, cantidades sin redondeo de porciones, requerimiento estimado, responsables, paginado, advertencias y errores visibles. Se evitó arrastrar receta de otra orden.
- Finalización únicamente con lote/cajas en Fábrica-Atrás, paquetes/cajas enteros y dos responsables diferentes. Pantalla de historial transmite opciones de cajas. Cierre y cancelación/inicio/toma revalidan estado bajo bloqueo.
- Numeración de lotes serializada por slug en cierres y altas, para no colisionar entre órdenes válidas concurrentes.
- Traslados/ventas serializados por producto; FIFO desempata por ID de caja; ventas manuales restringidas a Estantería activa. Ajustes siguen separados y no permiten inventar un motivo de salida. Sin redondear unidades fraccionarias.
- Lecturas por depósito, globales, tarjetas y alertas derivan unidades de cajas. Inventario anterior solo aporta umbrales. Cero con umbral sigue visible. Stock de Punto de Venta resuelve Estantería activa, sin ID fijo.
- Historial actual de cajas/salidas visible (últimos100); historial anterior conservado como consulta. Las escrituras del endpoint antiguo /movimientos responden409 con explicación: no mantienen un segundo saldo.

No se fusionaron insumos, convirtieron existencias anteriores, cambiaron recetas/nutrición/cuentas reales ni portaron reglas de One Factory. No incluye compra/recepción/reserva/consumo real de insumos ni snapshots históricos de recetas. El PDF identifica la composición actual al emitir.

## Migraciones preparadas y probadas localmente

1. `20261104224500_precio_vigente_unico`: índice parcial único por insumo con activo=true. Si hay duplicados previos, falla sin elegir cuál conservar; resolver con Administración antes de aplicar. El servicio bloquea la fila de insumo para serializar carga de referencia.
2. `20261104225000_porciones_fraccionarias_producto`: cambia cantPorcionesAportadas de entero a double precision. El frontend/backend ya calculaban decimales; el tipo anterior rechazaba esos productos. Conserva valores existentes. Cliente Prisma regenerado localmente, sin dependencia nueva.

El backend ejecuta migrate deploy en su arranque Docker actual: revisar y respaldar **antes de activar la nueva imagen**, no después del fallo de arranque.

## Evidencia de pruebas

Entorno: PostgreSQL **18** nativo aislado en `/private/tmp/aip-entrega-20261104/pgdata`, puerto55447, base `aip_entrega_test`, bind127.0.0.1. Sin datos comerciales, solo fixtures `example.invalid`. No se reutilizó DATABASE_URL de producción. Las 23 migraciones originales se aplicaron desde cero; las dos nuevas se aplicaron sobre esa base. PostgreSQL operativo documentado anteriormente es17: repetir ensayo en copia de su versión antes de desplegar; no usa sintaxis exclusiva de18.

- TypeScript backend: PASS.
- Build frontend `tsc -b && vite build`: PASS. Advertencias: Browserslist desactualizado, bundle grande y mezcla import estático/dinámico de file-saver; no son fallos de build.
- Pruebas sin DB: **15 PASS reportados** (incluye test padre de precios), cubren faltantes/costos/unidades, historia, permisos, nutrición y exportación.
- Integración PostgreSQL/HTTP: **13 PASS reportados** (test padre +12 casos), incluyendo diez cargas concurrentes de precio, permisos reales con JWT sintético, dos cierres de una orden, numeración de dos órdenes diferentes, venta/traslado concurrentes, rechazo de cancelación tardía, costo de producto de2.5 porciones persistido, saldo legacy999 ignorado y escritura legacy409.
- Navegador real headless: PASS fichas proveedor/insumo, acceso ADMINFAB, descarga PDF, stock/historial por cajas, rechazo de1.5unidades y ficha móvil390px sin desborde. Usa tokens sintéticos que atraviesan requireAuth + perfiles reales de la DB temporal; no se ensayó login con personal real.
- PDF: muestra corta1página, composición de52insumos3páginas y estrés con36nombres de más de300caracteres +65estados en8páginas. Texto extraído, márgenes y render visual revisados; Word contrastado en XML contra las mismas fuentes.
- Diff check de archivos propios PASS. El global puede marcar whitespace previo de frontend/.env: no se modificó para estas pruebas.

Pruebas reproducibles desde la raíz:

```sh
./Backend/node_modules/.bin/tsc --noEmit -p Backend/tsconfig.json
TSX_TSCONFIG_PATH=frontend/tsconfig.app.json node --import ./Backend/node_modules/tsx/dist/loader.mjs --test Backend/tests/precios-costos.test.ts Backend/tests/proveedores-fichas.test.ts frontend/tests/orden-export.test.tsx
```

Desde Backend, **solo tras preparar y verificar la DB sintética**:

```sh
AIP_TEST_DATABASE_URL='postgresql://aip_test@127.0.0.1:55447/aip_entrega_test' node --import tsx --test tests/entrega-postgres.test.ts
```

El test falla antes de importar Prisma si no coincide host127.0.0.1, puerto55447 y nombre exacto de base. Agrega fixtures, no borra tablas. AIP_TEST_SESSION_FILE es opcional y escribe tokens de práctica con modo0600 para usar en navegador; no incluirlo en Git.

`frontend/tests/entrega-browser.cjs` requiere app local5177/API4407, AIP_TEST_SESSION_FILE y Playwright externo disponible vía NODE_PATH; AIP_CHROMIUM_PATH permite usar Chromium instalado. Python Playwright no estaba disponible; se reutilizó Playwright Node y Chromium existente, sin instalar dependencias. No sobrescribir frontend/.env; VITE_API_URL se inyectó solo al proceso Vite de prueba.

## Antes de desplegar

1. Identificar commit/código realmente desplegado y versión PostgreSQL. Preparar backup restaurable y copia aislada de ese destino, sin exponer credenciales.
2. Ejecutar en copia `2026-11-04-preflight.sql`, que usa transacción READ ONLY. Confirmar los tres depósitos activos con nombres inequívocos.
3. Revisar precios activos duplicados. Definir manualmente referencia válida con Fede conservando registros y vigencias; nunca borrarlos para pasar el índice.
4. **Conciliar stock anterior y cajas.** Si hay unidades en Inventario pero no en cajas, este cambio no las convierte y las pantallas operativas mostrarán únicamente cajas. No sumar ambos saldos. Acordar corte/conteo físico y conciliación trazable antes del cambio. Si existen movimientos antiguos CREADO/EN_CAMINO, resolver su situación antes de congelar sus escrituras. Esta revisión puede bloquear deploy, no se omite por pasar tests sintéticos.
5. Política de vencidos confirmada e implementada: producto terminado sigue visible en físico; venta y traslado a Estantería seleccionan únicamente lotes vigentes por fecha/hora registrada. Movimientos entre otros depósitos, retiro desde Estantería y AJUSTE siguen permitidos. Stock comercial publicado excluye vencidos; el paso del tiempo no dispara automáticamente un webhook, verificar actualización periódica Woo al desplegar. FIFO se conserva entre habilitados.
6. Acordar IVA/base de precios; verificar unidades nutricionales, especialmente sodio. Los datos se conservan, no hay conversión general a mg.
7. Ensayar restauración+migraciones+flujo en copia de PostgreSQL operativo, pruebas por rol y muestra de orden real revisada por Fede.
8. Preparar commit/PR solo con cambios de entrega. Excluir frontend/.env, modificaciones previas de lockfiles y docs/n8n no revisados. Revisar diff de dependencias; no introducir credenciales ni fixtures reales.
9. En ventana acordada, desplegar backend y frontend de forma coordinada. API costo cambia a number|null; un frontend viejo puede romper al recibir null. Congelar operaciones durante el cambio si no hay estrategia de compatibilidad verificada.
10. Verificación posterior con usuarios autorizados: precio/historia/costo, PDF, cierre, Atrás→Intermedio→Estantería→venta, alertas/stock cero e integración Woo/n8n si está configurada. No repetir ventas web para probar sin reconocer idempotencia.

Esta guía prepara un despliegue futuro; no da por ejecutados backup, conciliación, prueba PostgreSQL17 ni aceptación de Fede.

## Reversión

Preparar imagen/commit anteriores y backup antes del cambio. Si falla la migración de índice, detener y revisar duplicados; no lanzar limpieza. Volver a un backend anterior después de admitir productos fraccionarios necesita compatibilidad de Prisma con Float: no convertir a entero truncando valores. Después de operar cajas, volver al escritor legacy reabre el doble saldo; acordar corte y reversión de aplicación con responsables, sin borrar movimientos ni reponer stock por inferencia.

## Material para entregar

- `../guias/guia-usuario-aip.md`: operación diaria.
- `../guias/guia-administracion-aip.md`: configuración, responsabilidades y conciliación.
- `../guias/ejemplos/orden-produccion-ejemplo.pdf`: ejemplo sintético, no receta comercial.
- `2026-11-04-refinamiento-operativo-aip.md`: diagnóstico original y alcance, conservado como antecedente.

## Actualización — regla de vencidos confirmada

Juani definió explícitamente: **visibles en stock físico, bloqueados a venta y traslado a Estantería de venta**. Implementación en servicio compartido de egreso (manual/Woo), traslado y publicación de stock comercial. UI distingue unidades físicas/vigentes/vencidas y calcula disponibilidad según venta o ajuste y destino de traslado. Sin migración nueva ni cambios de fechas/saldos reales.

Prueba PostgreSQL de vencidos agregada: físico conservado, movimiento Atrás→Intermedio permitido, Intermedio→Estantería rechazado sin registro, venta manual/web rechazada sin consumir ni marcar orden Woo, ajuste permitido, retiro desde Estantería permitido, traslado/venta en stock mixto seleccionan solo vigentes y webhook local publica solo unidades vigentes. Integración ahora **14 tests reportados PASS** (padre +13casos); con los15 sin DB, total29. TypeScript y build frontend repetidos. No se repitió el navegador en esta actualización; el nuevo saldo/modal está cubierto por build y regla real de servidor.

## Rama destino

Juani confirmó `modifMain` como destino del PR de AIP. Antes del merge, verificar el auto deploy de frontend y backend en Dokploy, conciliar el stock anterior con cajas y ensayar las migraciones en una copia.
