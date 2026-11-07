# AIP — revisión operativa y alcance de entrega

Fecha: 2026-11-04. Estado: diagnóstico de fuentes locales y propuesta verificable; no aceptación operativa ni constatación de la versión desplegada.

## Objetivo actualizado por Juani

La entrega a Fede reúne precios/proveedores/costeo y refinamiento de herramientas usadas diariamente: orden de producción exportable, información de fórmula/insumos y flujo de producto terminado **Atrás → Intermedio → Venta (Estantería)**. Venta descuenta del último depósito. Aprovechar definiciones de One Factory como referencia y mantener AIP como sistema operativo existente.

## Base revisada y límites de evidencia

Rama `fix/bugs-auditoria`, HEAD local `e7088a3` («Reactiva depósito desactivado al crear uno con el mismo nombre»), más cambios locales, incluidos los arreglos de costos documentados en `2026-11-04-precios-aip.md`. Este HEAD no prueba qué versión está desplegada. No hubo consulta remota, prueba contra producción ni modificación de datos.

Fuentes AIP:

- `frontend/src/features/pedidos/components/export/PedidoDetailPdf.tsx`, `PrintPedidoButton.tsx`, `PedidoDetailWord.ts`.
- `frontend/src/features/pedidos/pages/PedidoDetailPage.tsx`, `hooks/usePedidoDetail.ts`, `utils/insumos.utils.ts`.
- `Backend/src/repositories/pedidos.repository.ts`, `productos.repository.ts`, `services/pedidos.service.ts`, `services/lotes.service.ts` y rutas respectivas.
- `frontend/src/features/inventario/depositosConfig.ts`, `components/TrasladoCajasModal.tsx`, `EgresoModal.tsx`, `services/lote.service.ts`.
- `frontend/src/features/dashboard/components/PuntoVentaDashboard.tsx`, `docs/ESTADO-INVENTARIO.md`.
- `frontend/src/features/formulas/lib/mappers.ts`, `components/FormulaDetailModal.tsx`, `features/productos/hooks/useNutrition.ts`, formularios de insumo y proveedores.

Referencias One Factory leídas **sin modificar ese repositorio**:

- `../ultrafarm-platform/docs/ultrafarm/2026-11-02-refinamiento-post-demo.md`.
- `../ultrafarm-platform/docs/ultrafarm/2026-11-04-dos-frentes-de-trabajo.md`.
- `../ultrafarm-platform/apps/1factory/docs/slices/2026-11-03-c09-recepcion-lotes-inventario.md` (borrador; no asumir implementado).

No hay conector Notion disponible en la sesión. Se usaron fuentes locales, no se inventó contexto faltante.

## Qué existe y qué falta

| Área | Implementado en fuentes | Brecha para entregar |
| --- | --- | --- |
| Orden PDF | Producto, cantidades planificadas/reales, diferencia, creador/técnico, insumos estimados, historial | No identifica fórmula ni nutrición; omite depositador; redondea porciones con Math.round; sin paginado explícito |
| Exportación | PDF y Word desde el detalle | Fallos solo en consola; no se avisa al operario; cambios de PDF deben revisar coherencia con Word |
| Fórmula | Composición, porción, nutrición y costo | Fibra existe en datos pero no aparece en la tarjeta del detalle; unidad de sodio debe contrastarse con ficha; no inventar correcciones |
| Insumo | Maestro con nutrición por 100g, edición y precios/historial | Predomina formulario de edición; conviene ficha de consulta clara y base/unidades explícitas |
| Producto | Nutrición por porción/100g/total y costo de insumos | «Otros» se fija a 0 en useNutrition aunque existe en backend; faltan datos y no debe interpretarse como ausencia comprobada |
| Proveedor | Alta/edición/baja lógica, nombre, razón social, CUIT, teléfono, email | La pantalla no muestra qué insumos/precios tiene asociados; no es un módulo de compras/recepciones |
| Precios | Referencia global ARS/kg elegida al cargar proveedor, historial | Parche local evita costo cero y borrado; falta prueba DB/concurrencia y aceptación de criterio fiscal |
| Inventario físico | Lotes, cajas, traslados FIFO, egreso por unidades, caja parcial, registro de responsables | Dashboard aún lee Inventario viejo; reglas de depósito de venta no se aplican uniformemente en servidor |
| Producción→stock | Cierre con unidades/caja crea lote y cajas; cierre legacy incrementa Inventario | Puede quedar stock en dos modelos dependiendo del endpoint/datos; no eliminar ni convertir saldos sin diagnóstico aislado |

## P01 — orden de producción y ficha técnica legibles

**Resultado:** el operario imprime una orden útil para elaborar y revisar, con composición y bases de nutrición claras.

Contenido propuesto para PDF:

1. Orden/fecha/estado, producto, fórmula identificada por nombre e ID, peso de porción y cantidad de porciones por envase.
2. Cantidades planificadas y reales, preservando fracciones: no transformar 2.5 porciones en 3 al imprimir.
3. Insumos: identificación y nombre, gramos por porción y gramos requeridos para la orden. Mantener separado «requerido estimado» de «efectivamente consumido»; el segundo no está implementado para insumos.
4. Tabla nutricional de la fórmula por porción, con base en gramos y unidades por fila. Incluir fibra, evitar «otros=0» artificial y mostrar no disponible donde no haya dato confiable. No emitir etiquetas regulatorias ni cambiar nutrición fuente en este corte.
5. Responsables disponibles: creador/asignado/elaborador/depositador e historial. Los nombres registrados son constancias existentes; no presentarlos como firma digital autenticada.
6. Lote/deposito de destino y vencimiento **solo si se obtiene una relación real**. Si la orden aún no generó lote, indicar pendiente; no generar lote al exportar ni inferirlo por nombre de producto.
7. Fecha de emisión, paginado y encabezados de tabla repetidos en órdenes largas.

**Limitación material actual:** la orden referencia producto/fórmula actuales, no guarda snapshot de composición/nutrición. `PedidoDetailPage` obtiene la orden y luego consulta el producto; `computeInsumosRequeridos` escala desde su composición actual. Reimprimir una orden vieja puede reflejar una receta editada. En esta entrega debe explicitarse «composición actual al emitir; requerimiento estimado», sin venderlo como histórico inmutable. Crear snapshots de órdenes nuevas sería un corte persistente separado y no recupera datos antiguos.

**Datos necesarios:** pasar `productoDetalle` ya cargado al exportador; usar su fórmula mapeada. No copiar campos de API crudos ni recalcular nutrición con otra fórmula. Si falla la carga de composición, mostrar aviso y permitir identificar qué faltó; no exportar silenciosamente una lista vacía que parezca completa. El hook actual tampoco limpia productoDetalle en cambios de orden/errores: evitar arrastrar la receta de otra orden al reusar la pantalla.

**Aceptación:** orden sintética con 2.5 porciones mantiene 2.5; fórmula de 40g muestra nutrientes de 40g, no 100g; faltantes no se convierten en cero; orden de muchas líneas pagina sin cortar filas; PDF sin receta muestra advertencia; exportar no escribe DB; Word no contradice cantidades/bases del PDF.

## P02 — circuito de stock consistente con la operación

**Regla confirmada por Juani:** el depósito de venta es del cual se vende. Identificador técnico actual en AIP: `Estantería`; no renombrar registros existentes por suposición.

Recorrido objetivo:

`Orden finalizada → Lote/Cajas en Fábrica-Atrás → traslado a Intermedio → traslado a Estantería → venta por unidades`

Conservar FIFO actual, transferencia de cajas enteras, caja parcial en egreso, y dos responsables diferentes en traslados. La necesidad de devoluciones, transferencias excepcionales o ajustes en otro depósito es distinta de venta.

Diferencias verificadas:

- `lotes.service.ts::procesarVentaWoo` busca Estantería activa; egreso manual acepta `idDeposito` sin comprobar si es depósito de venta.
- Egreso permite motivos VENTA_MOSTRADOR, VENTA_WEB y AJUSTE. Se deben distinguir ventas de ajustes: restringir ventas a Estantería **no significa impedir ajustes justificados en Atrás/Intermedio**.
- Traslados aceptan cualquier origen/destino distinto. El recorrido normal puede guiarse en UI; no prohibir devoluciones o movimientos excepcionales sin acordar política.
- `PuntoVentaDashboard` obtiene alertas desde InventarioService viejo y pendientes desde MovimientoService; traslados nuevos escriben MovimientoCaja. Además de saldo, hay que revisar qué significa «pendiente» en el circuito nuevo, que hoy traslada al confirmar ambas constancias en una sola acción.
- `StockProducto` de cajas no trae umbral. Corregir alertas exige asociar umbral configurado por producto/depósito con unidades derivadas de cajas y contemplar **cero stock**, no solo productos que todavía tienen cajas.
- Finalización admite legacy sin unidadesPorCaja: hay dos fuentes de escritura. Antes de cerrar, inventariar qué pantallas/endpoints están activos y cómo se presentan saldos históricos. No sumar Inventario+Cajas ni migrar automáticamente porque puede duplicar stock.
- `egresarEnTx` redondea unidades antes de validar: una solicitud 1.5 puede convertirse en 2. UI también redondea. Rechazar unidades/cajas fraccionarias en lugar de alterar la solicitud; fracciones de porciones de receta son otra unidad.
- Traslado lee candidatas antes de abrir transacción; egreso calcula saldo y luego escribe valores absolutos. Hay riesgo de concurrencia; hace falta prueba PostgreSQL con dos acciones simultáneas antes de asegurar integridad. FIFO sin desempate explícito también requiere caso con fechas iguales.
- Stock/egreso no filtran lotes vencidos. No venderlo como «stock apto» sin definir tratamiento de vencidos; no pasar automáticamente de FIFO a FEFO.

**Aceptación mínima en DB aislada:** fabricar 25 unidades en cajas de 10/10/5 en Atrás; trasladar dos cajas a Intermedio y luego una a Estantería; vender 3 allí deja 7 vendibles. Atrás conserva 5 e Intermedio 10. Intento de venta desde Atrás/Intermedio se rechaza sin cambios; ajuste no se evalúa con reglas de venta. Solicitud 1.5 rechazada; venta excesiva y acciones concurrentes no generan sobreventa ni doble movimiento. Dashboard coincide con cajas y alerta al llegar a cero. No se escribe Inventario legacy en el recorrido nuevo. Verificar roles y doble responsable diferentes.

No declarar este paquete cerrado solo por agregar restricciones en el frontend.

## P03 — proveedores y fichas sin rehacer compras

**Qué hay hecho:** proveedor independiente del insumo, datos de contacto/fiscales, baja lógica, precio asociado a proveedor e insumo, historial. No hay recepción, compra ni inventario de materias primas detrás de ese precio.

**Mejora acotada propuesta:** búsqueda por nombre/CUIT/razón social; ficha proveedor con datos e insumos cuyo precio de referencia vigente pertenece a ese proveedor, acceso al historial disponible para roles actuales; ficha de insumo con nutrición por100g, precio ARS/kg, proveedor elegido y vigencia. En ausencia de precio, mostrar pendiente de carga. No contar el historial como disponibilidad de compra actual.

**Criterios:** proveedor A aparece ligado a insumo X mientras tiene referencia vigente; reemplazar por B cambia el vínculo vigente y mantiene historia de A; baja de A no borra precios; precio no cambia ficha nutricional ni fórmula. No ampliar lectura de precios a perfiles sin autorización por agregar un endpoint de ficha.

## Qué tomar de One Factory

| Definición revisada | Aplicación a AIP ahora | Límite |
| --- | --- | --- |
| R05/R06: bases nutricionales explícitas | Fórmula por porción, insumo por100g, producto por porción/100g | No reinterpretar sodio ni alterar datos para uniformar etiquetas |
| R07: insumo ≠ proveedor ≠ lote comprado | Identificar proveedor y referencia de precio sin duplicar maestro al cambiar proveedor | Variantes y recepciones son propuesta; AIP no las implementa con registrar un precio |
| Precio referencia ≠ costo real | Mantener ARS/kg confirmado y distinguir estimado de consumo real | No atribuir precio vigente a lotes históricos |
| Snapshot de composición en orden | Señalar límite actual del PDF y preparar corte futuro | No reconstruir receta histórica por inferencia |
| Reorganizar insumos antes de recepción | Revisión manual y mantener IDs/historia | No fusionar catálogo ni migrar 1:1 automáticamente |
| Compras/Depósito/Producción/Admin | Entender responsabilidad de cada paso | No copiar roles/RLS ni conceder permisos nuevos en AIP sin mapeo |

El C09 de One Factory está **en borrador**: recepción/reserva/consumo real de insumos no son funcionalidades listas para portar. El refinamiento del 02/11 contiene propuestas y decisiones pendientes; no todo es especificación aprobada.

## Orden de entrega recomendado

1. Terminar y validar precios/costeo ya parcheados, incluyendo concurrencia en base aislada.
2. P01: mejorar orden PDF y consulta técnica usando datos existentes, con muestra sintética revisada visualmente.
3. P02: unificar lecturas de stock y controlar venta desde Estantería; validar flujo completo con cierre de producción. Esto integra la entrega operativa: si sigue coexistiendo escritura legacy oculta o hay sobreventa concurrente, no presentarlo como circuito completo.
4. P03: consulta de proveedor/insumos asociados y ficha legible, respetando permisos de precio.

Pendientes de negocio concretos: unidad fuente de sodio si no es verificable en fichas; IVA/base de carga; tratamiento de vencidos; reglas de devoluciones/ajustes y movimientos excepcionales. Son decisiones de esos casos, no motivo para frenar las mejoras de exportación, consulta o la revisión independiente.

## Estado al finalizar esta revisión

Se produjo diagnóstico y alcance; no se modificó código operativo, exportadores ni DB en esta segunda etapa. No se generó ni validó visualmente un PDF nuevo. No se afirma que las brechas estén arregladas. Los tests/build del primer parche siguen documentados allí; no cubren los paquetes P01/P02/P03. Próxima ejecución: P01 con evidencia de PDF y luego P02 en PostgreSQL aislado, conservando trabajo previo.

## Ejecución posterior — 2026-11-04

Juani autorizó implementar las correcciones para preparar deploy y entrega con guías. P01/P02/P03 implementados y pruebas locales documentadas en `2026-11-04-despliegue-y-validacion.md`. Este informe conserva el diagnóstico previo; sus brechas no representan por sí solas el estado final. No hubo deploy. Vencidos y conciliación de stock previo siguen siendo condiciones explícitas antes de desplegar.

## Regla final de vencidos — confirmada e implementada

Juani definió producto terminado vencido visible en físico, sin venta ni traslado a Estantería. Movimientos entre otros depósitos, retiro desde Estantería y ajuste/merma permitidos. Reemplaza la decisión pendiente de vencidos de este diagnóstico. Evidencia y guías actualizadas en los documentos de entrega.
