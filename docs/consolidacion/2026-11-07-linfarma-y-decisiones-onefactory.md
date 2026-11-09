# Consolidación de Linfarma con decisiones de One Factory

Fecha: 2026-11-07. Estado: diagnóstico y propuesta de alcance para revisar con Juani/Fede.

## Objetivo

Linfarma/AIP debe sostener la operación cotidiana y tener continuidad como unidad de software de Ultra-Farm. Se propone llevar a AIP las decisiones que mejoran su autonomía, flexibilidad y trazabilidad, con entregas comprobables y mantenimiento acotado.

Este relevamiento compara archivos locales. El estado productivo de AIP queda por verificar. La entrega anterior se publicó como PR7 en borrador hacia modifMain y conserva pendiente el preflight operativo. El estado remoto actual del PR no se consultó en esta revisión.

## Fuentes contrastadas

En ultrafarm-platform, leídos como referencia funcional:

- docs/ultrafarm/2026-11-02-refinamiento-post-demo.md, decisiones R01–R12.
- apps/1factory/docs/slices/2026-11-03-c08-producto-desde-insumos.md, composición por porción y dos caminos de creación.
- apps/1factory/docs/slices/2026-11-03-c09-recepcion-lotes-inventario.md, reorganización previa de insumos y responsabilidades aprobadas el3/11.
- apps/1factory/docs/workflow/Roles-y-permisos.md, distingue permisos implementados de capacidades previstas.
- MEMORIA.md e Inicio.md, C07 verificado, C08 trabajo en curso según memoria y C09 borrador. La etiqueta «lista» de C08 expresa contrato de ejecución y no acredita despliegue o verificación de su implementación.

En AIP, schema Prisma, servicios de producto/fórmula/precio/lote, rutas de productos/insumos/lotes, utils/roles, lib/auth del frontend, informes y guías de la entrega anterior.

El conector Notion no está disponible en esta sesión. La nomenclatura «unidad dentro de células IT» se toma del pedido actual de Juani. La estructura operativa propuesta debajo es una recomendación, pendiente de acordar responsables.

## Inventario de decisiones y aplicación a AIP

| Decisión de negocio | AIP en el código revisado | Cambio candidato | Prioridad y alcance |
| --- | --- | --- | --- |
| R01/R11, acceso legible y cuentas de práctica por rol | Cuatro códigos de rol y permisos por rutas; auth frontend asigna userPerfil con IDs1/2/3 supuestos | Obtener las asignaciones reales desde sesión, probar cuentas por función, mensajes claros | Alta, pequeño/medio |
| Responsabilidades Compras/Depósito/Producción/Administración | Administración carga precios; técnico y venta tienen operaciones de stock amplias | Matriz de acciones y visibilidad de costo, luego adaptar rutas/UI y pruebas por rol | Alta, medio |
| R04, producto creado desde fórmula o insumos | Producto.idFormula obligatorio; servicio exige fórmula | Dos caminos de alta, composición propia persistida y costeable por porción | Alta, medio con migración |
| R05/R06, nutrición con base explícita | La entrega preparada ya mejoró porción,100g, fibra/otros y PDF | Completar revisión de fuente/unidades, validación de datos y ficha de composición directa | Continuación del catálogo |
| Historia de composición y nutrición en elaboración | Orden/PDF consultan composición actual; edición de fórmula puede afectar consulta posterior | Guardar versión o snapshot al crear/liberar orden y vincularlo al PDF | Alta, medio con migración |
| R07, separar insumo, proveedor y compra | Maestro nutricional más proveedor ligado al precio; recepción ausente | Revisión de catálogo y fichas, clasificación de equivalencias y especificaciones | Alta para definición, implementación por etapas |
| Un precio de referencia y costo comprado distinguibles | ARS/kg único confirmado para AIP; historia y costo incompleto implementados en entrega preparada | Conservar regla y completar carga real; compras conservarían sus propios costos históricos | Actual, carga operativa pendiente |
| R03, identificadores automáticos | IDs internos existentes; SKU comercial opcional | Mostrar códigos legibles derivados de IDs y conservar IDs originales/exportables | Media, pequeño si solo presentación |
| R08, recepción/disponibilidad/reserva/consumo de insumos | Stock actual de producto terminado por lote/caja; carece de inventario de materias primas | Recepción y movimientos de insumos, luego consumo asociado a orden | Opcional grande, requiere acuerdo de alcance |
| R09, sustitución con comparación nutrición/costo | Composición fija, sin flujo de autorización de sustituciones | Cambio por orden con comparación y responsable, ligado a snapshot | Posterior a composición histórica y existencias |
| R10, ubicaciones/estaciones | Atrás/Intermedio/Estantería y stock por cajas | Mantener circuito y agregar ubicación interna únicamente si operación lo requiere | Media/baja según demanda física |
| Calidad y aprobación distinta de quien elabora | Registro de dos responsables en cierre/traslado | Definir si se requiere aprobación autenticada de Calidad, bloqueo/liberación y evidencia | Decisión específica de operación |
| R12, productos externos en comercio | AIP modela fabricación con composición | Mantener contrato comercial explícito si se incorpora mercadería externa | Baja para consolidación de fábrica |
| R02, revisión de paleta | Estética actual operativa | Ajustes puntuales de legibilidad según revisión de pantallas | Baja frente a problemas de datos/flujo |

«Pequeño/medio/grande» compara superficie de cambio y datos afectados. No representa estimación de horas ni cotización.

## C01 — cerrar la entrega ya construida

Antes de sumar otra entrega, cerrar el PR preparado con copia operativa, conciliación de saldos anteriores/cajas y ensayo de migraciones. Verificar rama modifMain y auto deploy por servicio. Entregar guías actuales y registrar aceptación de Fede sobre precios, orden y flujo físico.

Resultado observable: una versión identificada en producción, responsables que la usan y verificaciones documentadas del recorrido completo. La ejecución de tests con fixtures no acredita la conciliación del stock de fábrica.

## C02 — accesos y responsabilidades de Linfarma

Propuesta inicial de capacidades para validar:

| Función | Capacidades propuestas |
| --- | --- |
| Administración de fábrica | Maestro/composición, revisión de precios, órdenes y autorizaciones excepcionales |
| Compras | Proveedores y referencias de precios; recepciones cuando exista ese módulo |
| Producción | Consultar composición y ejecutar órdenes asignadas |
| Depósito | Consultar físico, trasladar y registrar ajustes según autorización acordada |
| Venta | Consultar vendible de Estantería y registrar ventas |
| Consulta | Lectura según información autorizada |
| Administración de sistema | Accesos y configuración técnica |

Calidad requiere definir si constituye una función separada y qué transición aprueba. Dos nombres registrados hoy no prueban dos identidades autenticadas.

Implementar primero resolución de IDs reales de perfil en sesión y asignaciones, evitando el supuesto1/2/3 de frontend/src/lib/auth.tsx. Después adaptar el conjunto mínimo de permisos acordados sobre el middleware existente. El rol nuevo necesita su alcance del servidor y de la pantalla en la misma entrega.

La lectura de costo de producto permite actualmente cualquier autenticado, mientras fórmula/precios tienen restricciones distintas. Resolver quién ve costos/precios antes de crear el rol Consulta o entregar acceso de Depósito.

Aceptación: cada acción tiene un usuario permitido y otro rechazado por HTTP, perfiles con IDs distintos a los supuestos funcionan, y el empleado identifica su función en la sesión.

## C03 — producto directamente desde insumos y composición histórica

Propuesta funcional para AIP:

- «Usar fórmula» selecciona una fórmula reutilizable existente.
- «Cargar insumos» pide ingredientes y gramos por porción dentro del alta del producto. La porción resulta de sumar cantidades y el peso de envase deriva de las porciones aportadas.
- La composición propia pertenece al producto. Mantiene nutrición, costo, consulta y elaboración usando las mismas reglas del camino de fórmula.
- La falta de precio permite registrar el producto y conserva costo incompleto.
- La validación de cantidades, duplicados, insumos activos y datos nutricionales aplica en servidor.

**Adaptación técnica propuesta, pendiente de contrato.** AIP puede conservar su relación interna con Formula como motor de composición e incorporar una clase explícita reutilizable/propia de producto. Una composición propia debe quedar vinculada a un producto y filtrada de los selectores de fórmulas reutilizables. La creación completa debe ser transaccional. Este patrón se alinea con C08 y reduce la superficie de cambio sobre cálculo y producción, pero debe evaluarse contra los callers de AIP y sus datos existentes antes de escribir la migración.

Evitar ocultar composiciones propias mediante convenciones de nombres. La pertenencia y el tipo deben quedar expresados y protegidos en persistencia. Los datos actuales se clasifican de manera conservadora como reutilizables hasta revisión.

Completar conjuntamente la definición de historia. Al preparar una orden se debe conservar la composición/nutrición utilizada y la referencia de costo cuando corresponda. Una edición posterior crea una nueva revisión para futuras órdenes. Las órdenes anteriores a esta capacidad conservan identificada su limitación de historia disponible.

Hallazgo para este paquete: createProducto permite una fórmula protegida con validación comentada, pero updateProducto bloquea cualquier modificación del producto si su fórmula es protegida. Eso también afecta cambios de presentación/metadatos. Definir qué protege la bandera y aplicar la misma regla en ambos caminos.

Aceptación con un ejemplo: alta directa con2insumos,10g+30g, producto de2.5porciones produce100g; se guarda composición, se consulta nutrición/costo y se crea una orden imprimible. Un error intermedio revierte toda el alta. Cambiar la composición futura conserva la orden anterior y su documento. El camino de fórmula compartida sigue funcionando.

Si conviene dividir la ejecución, primero guardar snapshot para órdenes nuevas y luego agregar composición propia. El criterio es que el nuevo camino tenga historia y pruebas del ciclo completo.

## C04 — ordenar el catálogo sin perder trazabilidad

Preparar una revisión por insumo actual, con ID, nombre, unidad/base nutricional, uso en composiciones, proveedor de referencia y ficha documental. Registrar decisiones de mantener, renombrar, separar especificaciones o desactivar con responsable y motivo.

Un mismo nombre comercial no prueba equivalencia nutricional. El cambio de proveedor puede conservar la misma especificación o requerir una distinta. Una compra concreta añade fecha, lote externo, cantidad y costo. Estas distinciones deben verse en el catálogo acordado antes de montar existencias de materia prima.

Propuesta de implementación acotada: búsquedas/alias, ficha documental, advertencia de posibles duplicados y edición con historia de cambio. La eventual fusión necesita un mapa aprobado y conservación de referencias de órdenes/composiciones.

Aceptación: Fede puede identificar el insumo que usa una receta, su ficha válida y su precio de referencia. Los casos ambiguos quedan identificados para revisión.

## C05 — unidad operativa dentro de IT

Propuesta de legajo mínimo para Linfarma:

| Elemento | Qué debe quedar registrado |
| --- | --- |
| Responsable funcional y técnico | Quién acepta cambios, resuelve dudas de fábrica y mantiene el servicio |
| Servicio y entornos | Repo, rama de integración, URLs, servicios Dokploy y versión desplegada |
| Datos | Responsable del catálogo, precios y conciliación, backups y restauración probada |
| Operación | Guías, cuentas por función, alta/baja de personal y canal de incidencias |
| Entrega | Alcance, evidencia, aceptación y reversión por versión |
| Integraciones | Contrato Woo/n8n, identificación/idempotencia, fallos pendientes y quién los sigue |
| Intercambio futuro | Exportación identificable de catálogo/composición/órdenes/lotes con unidades y fechas |

Usar los IDs conservados para una futura correspondencia entre sistemas y tratar SKU como dato comercial. Antes de operar dos sistemas sobre existencias, acordar cuál registra cada movimiento y cómo se detectan duplicados. Esta definición puede documentarse con las guías y los servicios existentes.

## C06 — materias primas y costo real, bajo alcance separado

Solo si Fede necesita esta capacidad durante la convivencia y acuerda mantenerla en Linfarma, preparar recepción→existencia→selección/consumo de insumos. Requiere catálogo revisado, política de lotes/ubicación, precio de compra y devoluciones/mermas. Después se puede especificar sustitución y comparación nutricional/costo por orden.

El tamaño es mayor porque incorpora una existencia nueva y cambia el cierre de producción. La decisión debe ponderar necesidad diaria, duración prevista de convivencia y capacidad de mantenimiento del equipo. C09 de One Factory aporta conocimiento de dominio y todavía contiene decisiones abiertas.

## Secuencia propuesta

1. Cerrar entrega actual en operación.
2. Accesos reales y matriz de permisos.
3. Producto directo/composición propia con historia de órdenes.
4. Catálogo revisado y legajo de unidad IT.
5. Evaluar recepción/consumo real según demanda operativa y acuerdo de mantenimiento.

La recomendación de esta revisión es priorizar2y3 después del cierre operativo. Aportan flexibilidad visible y reducen dependencia de una sola persona para operar el sistema. Las próximas implementaciones necesitan contratos pequeños con aceptación, especialmente cambios de permisos, composición e historia.

## Estado de esta sesión

Se elaboró el inventario y la propuesta. No se modificó el comportamiento del software ni se amplió el PR7. El objetivo de este documento es elegir el próximo paquete y precisar sus reglas con la operación.
