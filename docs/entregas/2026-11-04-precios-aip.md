# Entrega AIP — precios y proveedores

Estado: definición y diagnóstico. Fuente: Juani/Fede,2026-11-04. Objetivo: mejorar el sistema actual para entregar y cobrar una misión concreta, separada de1Factory+1Shop.

## Primer resultado a concretar
Registrar proveedores ypreciosdeinsumos, consultar historial/vigencia ycostear fórmulas/productos con unidades correctas. Recorrido mínimo propuesto: proveedor → insumo → precio → fórmula/producto → costo yfaltantes. Los precios todavía hay que cargarlos: sinprecio no debe convertirse encosto0.

Ya existen:
- Backend/src/services/preciosInsumo.service.ts, controllers/preciosInsumo.controller.ts y proveedores.service.ts.
- Backend/src/prisma/schema.prisma y migración20260625100000_add_proveedores_precios_insumo.
- frontend/src/features/insumos/components/precio/PrecioInsumoModal.tsx y features/proveedores.
- Backendprecioactivo hoy reemplaza todos los anterioresdelinsumo, sinseparar proveedor: verificar semántica antes de cambiar.

Esto obliga a revisar el estado real antes de implementar. No asumir que faltatodo ni darporcerrado solo porque hay pantalla/servicio.

## Relevamientos relacionados
Juani pide también mejorar proveedores/insumos/fórmulas, revisar órdenes y emprolijar inventario. Primero identificar fallas, riesgo y tamaño de cambios; convertirlos en paquetes adicionales si exceden lo necesario para precios/costeo. No absorber reconstrucción integraldeinventario enuna entrega presentada como «solo precios».

Aclaraciones deJuani previas útiles, a confirmar encontextoAIP:
- Diferenciar insumobase/especificación, proveedor ycada compra/lote, con cantidad/fecha/precio.
- Quiere reorganizarinsumos ANTES de basarinventario ensu catálogoactual; no hay autorización para fusionar automáticamente.
- Aprobó en diseño1Factory que Compras registre recepciones/precios, Depósito mueva existencias, Producción consuma lotes asignados yAdministración autorice sustituciones. AIP tiene rolesdistintos: mapearlos y acordar equivalencia antesdeampliarpermisos.
- Fórmula representa porción; producto puede tener porcionesfraccionarias. No trasladar estasdefiniciones al esquemalegacy sin contrastar fuentes y operación.
- Conservar ycompararnutrición/costos; no modificarrecetas históricas automáticamente por cambiarproveedor.

## Fuentes y seguridad
Harness histórico/global: ultra-farm/MEMORIA.md, tecnologia/PLAN-1FACTORY-1SHOP.md, RELEVAMIENTO-FABRICA.md, docs/ESTADO-INVENTARIO.md. Usarlos como referencia y separar propuestas de lo implementado. Los contratos deultrafarm-platform no gobiernan AIP.

Backup fuente privado: ultra-farm/_data/1factory-aip-2026-10-23 y copiaoriginal enDownloads. Trae116insumos/91fórmulas/87productos; sinproveedores niprecios. Ya se detectaron valoresnutricionales dudosos ypesos inconsistentes; preservarfuente, no inventarcorrecciones. Nunca compartir dump/credenciales enprompts/Git.

## Para marcar un paquete listo
Acordar qué registra elprecio (moneda/unidad/vigencia), elección sihayvariosproveedores, fórmuladecosteo, permisosAIP, historial ycasos defaltantes. Cada decisión conejemplo ycontraejemplo. Preparar DB+API+UI+pruebas delrecorrido y exclusiones. Validación enbaseaislada, sinseed/resetprod. No comprometerse a1Shop, migraciónSupabase niinventarcronogramas/cotización.

## Contrato vertical C01 — 2026-11-04

Estado: parche implementado localmente; pendiente aceptación operativa y prueba PostgreSQL/navegador. No es una entrega cerrada ni desplegada.

### Reglas y alcance

- **Confirmación de Juani en este chat:** un precio de referencia por insumo en **ARS/kg**. Elegir proveedor al cargar reemplaza el vigente global, incluso si pertenece a otro proveedor. No se selecciona el más barato ni se mantienen cotizaciones activas simultáneas.
- Alta existente: proveedor activo + insumo activo + precio numérico finito mayor a cero. Vigencia inmediata desde hora de servidor; el precio anterior recibe fechaHasta y queda inactivo. No hay fecha retroactiva/futura ni conversión de monedas.
- La UI identifica ARS/kg. Persistencia actual no tiene moneda ni tratamiento fiscal: este corte usa exclusivamente ARS y costea el valor ingresado, sin agregar/quitar IVA. Confirmar con Fede el criterio fiscal de carga antes de ingresar precios comerciales.
- Fórmula: suma de `cantidadInsumo` (gramos por porción) / 1000 × precio vigente por kg. Producto: resultado × `cantPorcionesAportadas`, admite porciones fraccionarias según el campo actual. No se modifican composición ni pesos históricos.
- Costo de **insumos de referencia**, sin envase, mano de obra, impuestos adicionales, gastos generales ni costo real por lote. No es precio de venta.
- Si falta cualquier precio o la fórmula no tiene líneas: `esParcial=true`, `costoPorPorcion=null` y, en producto, `costoPorPaquete=null`. Se conservan aportes conocidos en detalle y nombres de insumos sin precio. UI muestra **Costo incompleto**, nunca `~$0` como total.
- Historia no eliminable: se retira la acción de la UI; el DELETE existente responde 400 con explicación, sin escritura. Corregir cargando otro precio conserva ambas entradas.
- Sin fusiones de catálogo, sustituciones, recetas nuevas, cambios de stock, nutrición o identidades.

### Permisos actuales, sin ampliaciones

| Acción | Autorización backend actual |
| --- | --- |
| Consultar proveedores e insumos | Usuario autenticado |
| Alta/edición/baja lógica proveedor o insumo | ADMINSIS / ADMINFAB |
| Consultar historial y cargar precio | ADMINSIS / ADMINFAB |
| Consultar costo fórmula | ADMINSIS / ADMINFAB / TECNICO |
| Consultar costo producto | Cualquier usuario autenticado |
| Borrar precio histórico | Bloqueado por servicio, incluso administradores |

Diferencia detectada: costo producto expone detalle/precio/proveedor a todo autenticado; fórmula es más restringida. Se conserva el permiso actual, requiere decisión explícita si se desea restringirlo. Los roles de 1Factory no se trasladan a AIP.

### Recorrido real en fuentes

- Proveedor: `Backend/src/services/proveedores.service.ts`, rutas `/proveedores`, pantalla `frontend/src/features/proveedores/pages/ProveedoresPage.tsx`. Baja lógica bloquea proveedores con precios activos.
- Insumo/precio: rutas `/insumos/:id/precios`, servicio `preciosInsumo.service.ts`; carga e historial dentro de `InsumoFormModal` con `PrecioInsumoModal`/`PrecioInsumoHistorial`.
- Fórmula: `/formulas/:id/costo` consulta precios activos, cálculo en `formulas.service.ts`; presentación en `FormulaDetailModal`.
- Producto: `/productos/:id/costo` obtiene fórmula/insumos/precios; presentación en `CostoProductoCell` y `ProductoNutritionalModal`. Ambos contratos TS ahora admiten null.
- La migración existente de precios tiene índices comunes, **sin unicidad de precio activo por insumo**. Dos altas concurrentes podrían dejar más de uno vigente y las consultas con take:1 no resuelven esa ambigüedad. No se declara cubierta concurrencia con un doble en memoria; queda endurecimiento pendiente con PostgreSQL aislado antes de dar el circuito por cerrado. No se agregó migración sin probar.

### Aceptación observable

1. Crear proveedor y cargar precio a un insumo: precio visible en ARS/kg, vigente e incluido en costeo.
2. Ejemplo sintético, no comercial: 100g a 1000 ARS/kg + 50g a 2000 ARS/kg = 200 ARS/porción; producto de 2.5 porciones = 500 ARS.
3. Reemplazar el primer precio por 1500 ARS/kg de otro proveedor: costo producto = 625 ARS; anterior cerrado y conservado.
4. Sin precio del segundo insumo: totales null, detalle del primero disponible, faltante identificado y UI «Costo incompleto». Fórmula vacía tampoco da cero.
5. Intentar borrar historia: error sin perder registros. Usuarios fuera de roles no cargan precios.
6. Verificar en base aislada transacción, concurrencia y permisos por HTTP; después recorrer alta→historial→fórmula→producto en navegador. **Pendiente**, no demostrado por build/tests sintéticos.

### Evidencia local

- Backend: `cd Backend && ./node_modules/.bin/tsc --noEmit` — PASS.
- Frontend: `cd frontend && npm run build` (tsc -b + Vite) — PASS; avisos de Browserslist desactualizado y bundle grande, fuera de este arreglo.
- `cd Backend && node --import tsx --test tests/precios-costos.test.ts` — PASS, 7 tests reportados (un test padre y seis subcasos). Dobles en memoria para Prisma: sin cliente real ni conexión. Prueba faltantes totales/parciales, validación, conversión gramos/kg, porciones fraccionarias, reemplazo entre proveedores, historia y serialización del controlador producto.
- Docker no disponible: socket local inexistente. No se eligió una URL de conexión ni se leyó/reutilizó un destino productivo. No se ejecutaron persistencia, migraciones, seeds, resets, limpieza, push ni deploy.
- `tsx` CLI intentó crear un socket IPC bloqueado por sandbox; ejecución alternativa con `node --import tsx` pasó sin escalación.
- Diff check acotado a archivos propios PASS; el global informa whitespace preexistente en frontend/.env, preservado.
- No hay conector Notion disponible en esta sesión; diagnóstico basado en instrucciones/documentos locales y fuentes. No se verificó estado remoto/desplegado.

### Órdenes e inventario: candidatos separados

- Confirmado en `pedidos.service.ts`: finalizar con `unidadesPorCaja` crea Lote+Cajas; sin ese dato escribe Inventario agregado legacy. Hay dos endpoints `/finalizar` y `/finalizar-elaboracion`; no cambiar stock por inferencia.
- Confirmado en `PuntoVentaDashboard.tsx`: alertas consultan `InventarioService` antiguo; `docs/ESTADO-INVENTARIO.md` ya registra el desacople frente a cajas como fuente de stock. Candidato: corregir alertas con aceptación por depósito/lote y prueba aislada, separado de precios.
- Antes de incluir otros arreglos, pedir acción que falla, resultado esperado y ejemplo anonimizado. Pregunta enviada; pendiente respuesta. No se tocaron estos módulos.

### Pendientes para cierre con Fede

Criterio fiscal al ingresar ARS/kg, precios comerciales reales, fallas específicas de órdenes/inventario a contratar, prueba DB aislada y navegador con roles actuales, endurecimiento de concurrencia y aceptación operativa. No presupone reconstrucción de inventario ni migración a 1Factory.

## Ampliación de alcance solicitada por Juani

Juani aclaró que producción/inventario requieren refinamiento operativo, en particular PDF de orden, detalle de fórmula/nutrición/insumos y recorrido Atrás→Intermedio→Venta. La venta sale del depósito final (Estantería). Pidió consultar One Factory para enriquecer la entrega. Diagnóstico actualizado, diferencias y paquetes P01/P02/P03 en `2026-11-04-refinamiento-operativo-aip.md`. Es una propuesta verificable basada en fuentes locales; no se declara implementada ni desplegada. Referencias One Factory consultadas solo lectura, sin portar migraciones/roles.

## Implementación y evidencia posterior — 2026-11-04

La concurrencia se endureció con bloqueo transaccional por insumo e índice único parcial, probado en PostgreSQL aislado. Se corrigió la columna de porciones del producto a Float para persistir decimales que ya calculaba el servicio. P01/P02/P03, pruebas y condiciones de deploy en `2026-11-04-despliegue-y-validacion.md`; guías en `../guias/`. Esta actualización sustituye los pendientes técnicos resueltos arriba, sin declarar desplegada la entrega.
