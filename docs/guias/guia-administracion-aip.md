# Guía de administración de AIP

Entrega de mejoras operativas · 4 de noviembre de 2026

Esta guía explica la configuración operativa y los controles que acompañan la entrega. Para tareas diarias de fábrica y venta, usar la [guía de usuario](guia-usuario-aip.md).

## Qué incorpora la entrega

- Precio de referencia único por insumo en **ARS/kg**, con proveedor y conservación del historial.
- Costos incompletos identificados, sin convertir faltantes en cero.
- Consulta de proveedores e insumos asociados a sus referencias vigentes e históricas.
- Ficha de insumo con nutrición por 100 g.
- Orden PDF/Word con fórmula actual, nutrición por porción, composición estimada y responsables.
- Finalización con paquetes y unidades por caja enteros, dos responsables distintos y entrada de lote/cajas en Atrás.
- Venta desde Estantería; ajustes separados de ventas.
- Alertas de stock basadas en cajas, incluyendo faltantes con saldo cero según los umbrales configurados.

No incluye órdenes de compra, recepciones de materia prima, reservas o consumo real de insumos, sustitución de recetas ni reorganización automática del catálogo.

## Perfiles y responsabilidades

Conservar cuentas personales y asignar únicamente los perfiles necesarios. Registrar dos nombres en una operación deja una constancia; no equivale a una firma digital.

| Acción | Perfiles habilitados actualmente |
| --- | --- |
| Mantener insumos, proveedores y precios; consultar historial de precios | Administración de sistema (ADMINSIS), administración de fábrica (ADMINFAB) |
| Mantener productos y fórmulas; crear órdenes | ADMINSIS, ADMINFAB |
| Consultar fórmulas y sus costos | ADMINSIS, ADMINFAB, técnico (TECNICO) |
| Tomar, finalizar o cancelar una orden | ADMINSIS, ADMINFAB, TECNICO; sujeto al estado de la orden |
| Consultar lotes/stock y operar traslados o egresos | ADMINSIS, ADMINFAB, TECNICO, encargado de punto de venta (ENCPTOVENTA) |

ADMINFAB cuenta ahora con acceso de navegación a **Insumos** y **Proveedores**, usando las autorizaciones que ya tenía para administrarlos.

La consulta del costo de producto conserva su acceso actual para usuarios autenticados y puede incluir detalle de precios/proveedor. Si la fábrica necesita ocultar esos costos a determinados perfiles, debe definirse un cambio de permisos específico; no suponer que esa información ya está restringida solo a administración.

Las opciones visibles dependen del perfil y de las pantallas de cada cuenta. Esta entrega no incorpora los roles de Compras/Depósito del proyecto One Factory.

## Preparar los datos de operación

### Depósitos

Verificar que existan y estén activos los depósitos de la operación:

| Depósito | Uso |
| --- | --- |
| Fábrica-Atrás | Entrada del producto recién elaborado |
| Intermedio | Etapa intermedia del circuito |
| Estantería | Stock desde el cual se venden unidades |

Mantener estos nombres y revisar duplicados o nombres parecidos antes de operar. No renombrar ni recrear depósitos con stock para corregir una pantalla. El circuito de venta debe reconocerse de manera inequívoca.

### Productos y fórmulas

Antes de elaborar, revisar fórmula asociada, porción, peso del producto, porciones por envase y días de vencimiento. Estos datos deben corresponder a la receta y presentación reales; no completar valores de relleno.

Los paquetes elaborados y las unidades por caja son enteros. Las porciones de una fórmula o las porciones por envase pueden ser fraccionarias: no son la misma unidad.

### Nutrición

La ficha de insumo usa base 100 g y la fórmula usa base porción. Un dato no disponible no debe sustituirse por cero. La entrega conserva los valores fuente y las unidades existentes; no realiza una conversión general de sodio de g a mg ni valida fichas nutricionales comerciales.

Contrastar unidades y valores con documentación confiable del insumo antes de corregirlos. Cambiar un proveedor de referencia no cambia automáticamente la nutrición ni autoriza sustituir ingredientes.

## Cargar proveedores y referencias de precio

1. Buscar primero por nombre, razón social o CUIT.
2. Mantener una ficha de proveedor con los datos reales disponibles.
3. Para cada insumo, registrar proveedor e importe **ARS/kg**, positivo y vigente desde su carga.
4. Revisar que figure en la ficha del insumo y en la del proveedor.
5. Consultar una fórmula y un producto que usen ese insumo para comprobar el resultado.

Hay una referencia vigente por insumo, no una cotización activa por cada proveedor. Reemplazar A por B cambia la referencia de costeo y conserva el registro anterior de A.

La baja de un proveedor es lógica y no borra sus referencias históricas. Si tiene precios vigentes, primero reemplazarlos por la referencia válida que corresponda; no crear importes ficticios para permitir la baja.

### Criterio de IVA y adicionales

Acordar con Fede el criterio de carga antes de ingresar precios comerciales: el sistema costea el número ingresado y no agrega ni quita IVA, flete o descuentos automáticamente. Aplicar el mismo criterio a todos los insumos y documentarlo en el procedimiento interno.

El costo mostrado es de insumos según referencia; no incorpora automáticamente envases, mano de obra o gastos generales. No presentarlo como costo real histórico del lote ni como precio de venta.

## Revisar órdenes e informes

Antes de entregar una orden para elaborar, verificar producto, fórmula y cantidades. PDF y Word usan la composición **actual al emitir**, con requerimientos estimados. No hay una copia histórica inmutable de la receta por orden.

Si se modifica una fórmula, una reimpresión antigua puede mostrar esa nueva composición. Conservar el documento usado en la elaboración conforme al procedimiento documental de la fábrica; no atribuirle al sistema un historial de recetas que todavía no tiene.

Lote, vencimiento y ubicación se consultan en Inventario. Exportar el informe no crea lotes y los responsables impresos no acreditan firma digital.

## Controlar producción y stock

En el recorrido actual, finalizar una elaboración requiere cantidad real de paquetes, unidades por caja, vencimiento y dos responsables distintos. La confirmación crea lote y cajas en Fábrica-Atrás; luego se realizan los traslados físicos hasta Estantería.

Las ventas se registran únicamente desde Estantería. **Ajuste / merma** es un egreso separado y puede afectar el depósito donde está la diferencia física; no debe utilizarse para evitar un traslado o una restricción de venta.

Las existencias operativas se consultan por cajas/lotes. No sumar saldos de pantallas antiguas con el stock de cajas: podrían representar la misma mercadería. Cualquier conciliación de saldos anteriores necesita revisión específica con conteo físico y trazabilidad; esta entrega no convierte ni borra esos saldos automáticamente.

### Alertas y umbrales

Revisar los umbrales de los productos y depósitos que se desean vigilar. El saldo de las alertas corresponde a unidades en cajas; un producto con umbral configurado también debe poder alertar al llegar a cero. Una alerta informa cantidad, no certifica calidad ni aptitud del producto.

### Vencimientos y excepciones

Regla confirmada por Juani para producto terminado: conservar vencidos en stock físico, bloquear su venta y su traslado a Estantería. Se permiten movimientos entre los otros depósitos, retiro desde Estantería y salida por ajuste/merma. Se compara la fecha/hora de vencimiento registrada contra el momento de la operación; no se alteran fechas ni cantidades por alcanzar ese momento. FIFO se conserva entre lotes habilitados, sin cambiar a FEFO.

Los movimientos habituales priorizan los lotes elaborados más antiguos. Las reglas de excepciones no se reemplazan por elegir otro motivo de salida.

## Comprobación de puesta en uso

Realizar estas comprobaciones con datos autorizados antes de anunciar la entrega como operativa:

1. Una cuenta ADMINFAB accede a Insumos/Proveedores y consulta sus fichas.
2. Un precio nuevo se ve en el insumo/proveedor y el anterior sigue en historial.
3. Un producto con precio faltante muestra **Costo incompleto**.
4. PDF y Word coinciden con fórmula, porción y cantidades verificadas.
5. Una elaboración genera las cajas esperadas en Atrás.
6. Los traslados actualizan origen y destino; las ventas salen de Estantería.
7. Saldo físico, vista de cajas y alertas coinciden.
8. Se define con responsables cómo informar y resolver errores de precios, receta o stock.

No repetir una venta web manualmente sin verificar si ya fue registrada. Si falla la integración comercial o el saldo no coincide, informar el caso antes de realizar otra operación que pueda duplicar el descuento.

## Registrar una incidencia

Anotar fecha, cuenta/perfil, acción realizada, número de orden o lote, producto/depósito, resultado esperado y mensaje recibido. Evitar enviar contraseñas o datos sensibles. Conservar los documentos utilizados y comunicar la diferencia a quien administra AIP.

## Registros del circuito anterior

Los movimientos anteriores se conservan para consulta. Antes de actualizar la versión, resolver con los responsables las operaciones que todavía figuren en curso y conciliar sus saldos con cajas/conteo físico. Las pantallas operativas nuevas leen cajas; esta entrega no transforma automáticamente los contadores anteriores ni suma ambas fuentes.

La API de venta web aplica el mismo bloqueo. AIP informa a la integración únicamente las unidades vigentes de Estantería cuando emite una actualización de stock. El mero paso del tiempo no dispara por sí solo un aviso a Woo: verificar el mecanismo de actualización periódica comercial al desplegar; una venta que llega a AIP no podrá consumir vencidos aunque el catálogo web esté desactualizado.
