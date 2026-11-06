# Guía de uso de AIP

Entrega de mejoras operativas · 4 de noviembre de 2026

Esta guía acompaña la versión con precios de referencia, fichas de insumos/proveedores y mejoras de órdenes e inventario. Las opciones disponibles dependen del perfil de tu cuenta.

## Recorrido de trabajo

**Consultar producto y fórmula → crear orden → elaborar → registrar lote y cajas en Atrás → trasladar a Intermedio → trasladar a Estantería → vender.**

Estantería es el depósito de venta. El stock que todavía está en Atrás o Intermedio debe trasladarse antes de venderse.

## Consultar un insumo

1. Entrá a **Insumos** y buscá por nombre.
2. Abrí el menú de tres puntos de la fila y elegí la consulta de ficha.
3. Revisá su identificación y los valores nutricionales: están expresados **por 100 g de insumo**.
4. Si tu perfil permite consultar precios, también vas a ver el proveedor de referencia, el precio en **ARS/kg**, su vigencia y el historial.

Si aparece **Pendiente de carga**, falta registrar un precio. Si aparece un error de consulta, volvé a abrir la ficha; no lo interpretes como ausencia de precio.

Elegir otro proveedor para el precio no modifica la nutrición ni la receta del insumo.

## Registrar proveedores y precios

Estas acciones corresponden a administración de fábrica o de sistema.

### Proveedor

1. Entrá a **Proveedores**.
2. Buscá por nombre, razón social o CUIT para comprobar si ya existe.
3. Si falta, elegí **Nuevo proveedor** y completá los datos disponibles.
4. Desde la consulta de su ficha podés revisar sus insumos con referencia vigente y las referencias anteriores.

Que un insumo figure en esta ficha significa que tiene un precio asociado a ese proveedor. No indica que se haya realizado una compra ni que el proveedor tenga mercadería disponible.

### Precio de referencia de un insumo

1. Entrá a **Insumos**, buscá el insumo y abrí **Editar**.
2. Elegí **Cargar precio** o **Actualizar precio**.
3. Seleccioná el proveedor.
4. Ingresá el importe **en pesos argentinos por kilogramo**, mayor que cero. Si la cotización viene por bolsa u otra presentación, verificá su equivalente por kilogramo antes de cargarla.
5. Agregá una observación si corresponde y guardá.
6. Comprobá el nuevo precio y el proveedor en la ficha.

Hay **un único precio de referencia vigente por insumo**. Cargar otro reemplaza al anterior, incluso cuando cambia el proveedor. El anterior queda en el historial y no se borra. Para corregir un importe, cargá uno nuevo.

El sistema usa el valor ingresado: no suma ni descuenta IVA automáticamente. Administración debe acordar el criterio de carga antes de ingresar precios comerciales.

## Entender el costo

El costo mostrado corresponde a los insumos de la fórmula según sus precios de referencia. El costo por envase utiliza la cantidad de porciones del producto, que puede tener decimales.

**Costo incompleto** significa que falta algún precio o que no hay composición suficiente para calcularlo. Revisá los insumos indicados; no significa que fabricar ese producto cueste cero. El desglose puede mostrar aportes conocidos aunque todavía no exista un total completo.

Este costo no incluye automáticamente envases, mano de obra, gastos generales ni otros adicionales. Tampoco representa el costo real de un lote comprado o elaborado.

## Consultar fórmula y nutrición

- **Insumo:** valores por 100 g.
- **Fórmula:** valores por la porción indicada en gramos.
- **Producto:** revisar la base que indica cada tabla, por porción, por 100 g o por envase.

No compares dos valores sin comprobar su base. **No disponible** significa que falta un dato; no equivale a cero. Si una unidad o un valor de la ficha no coincide con la documentación del insumo, avisá a administración antes de modificarlo. No conviertas sodio de g a mg por suposición.

## Descargar la orden de producción

1. Entrá a **Órdenes/Pedidos** y abrí el detalle de la orden.
2. Verificá producto, fórmula, cantidades e insumos requeridos.
3. Elegí **Exportar → Descargar PDF** o **Descargar Word**.
4. Revisá el documento antes de imprimir o usarlo para elaborar.

La exportación incluye fórmula, porción, nutrición, cantidades, composición requerida, responsables registrados e historial. El PDF numera sus páginas y repite los encabezados de composición cuando continúa en otra página.

La composición corresponde a **la fórmula actual al emitir el documento**. Reimprimir una orden antigua puede mostrar una receta modificada después de su creación. Las cantidades de insumos son requerimientos estimados, no consumo real registrado.

Si aparece **Composición incompleta o no disponible**, verificá la fórmula antes de elaborar. El documento no debe usarse como receta completa mientras siga ese aviso. Si falla la exportación, vas a ver un mensaje para reintentar.

El informe no crea lotes. Consultá lote, vencimiento y ubicación en Inventario.

## Finalizar una elaboración

1. Abrí una orden que esté **En elaboración**.
2. Elegí finalizar y cargá la **cantidad real de paquetes**, entera y mayor que cero.
3. Indicá las **unidades por caja**, enteras y mayores que cero.
4. Completá los días de vencimiento si el producto no los tiene configurados. Si ingresás este dato, debe ser un entero mayor que cero.
5. Seleccioná al elaborador y al depositador: deben ser **dos personas distintas**.
6. Revisá el reparto de cajas y confirmá.
7. Comprobá el lote y sus cajas en **Fábrica-Atrás**.

Ejemplo de reparto: 25 paquetes con 10 unidades por caja generan dos cajas de 10 y una parcial de 5.

Una orden ya finalizada no se vuelve a finalizar para corregir un saldo. Si algo no coincide, informá el número de orden y la diferencia a administración.

## Consultar y trasladar stock

1. En Inventario, abrí la vista de stock por cajas y elegí el depósito.
2. Revisá producto, cantidad de cajas, unidades, lote y vencimiento.
3. Elegí **Trasladar cajas**.
4. Seleccioná origen, destino, producto y cantidad **entera** de cajas.
5. Elegí responsables de envío y recepción distintos.
6. Confirmá y revisá los saldos de ambos depósitos.

El recorrido habitual es **Fábrica-Atrás → Intermedio → Estantería**. Los traslados mueven cajas completas, incluida una caja parcial como unidad física. La selección prioriza los lotes elaborados más antiguos.

No registres una venta para simular un traslado. Si necesitás una devolución o un movimiento excepcional, acordalo con administración.

## Registrar una venta o una salida

### Venta

1. Elegí el depósito **Estantería**.
2. Abrí **Registrar salida**.
3. Seleccioná producto, unidades enteras y el motivo de venta correspondiente.
4. Confirmá y verificá el saldo.

La venta descuenta unidades y puede dejar una caja parcial. Si falta stock, no se completa la operación. Para vender stock que está en otro depósito, trasladá primero las cajas a Estantería.

Una venta web ya registrada por la integración no debe cargarse otra vez manualmente. Si hay dudas sobre si ingresó, consultá a administración antes de repetirla.

### Ajuste o merma

**Ajuste / merma** es una salida para reflejar una diferencia física real; no es una venta. Elegí el depósito afectado y usá este motivo según el procedimiento acordado con administración. No sirve para aumentar stock ni para moverlo entre depósitos.

## Ante una diferencia

- **Precio equivocado:** pedir a administración que registre otro precio y conserve el historial.
- **Costo incompleto:** revisar los insumos sin precio o la composición faltante.
- **Stock insuficiente:** verificar depósito, unidades y traslado pendiente de realizar.
- **Falta el depósito o el vencimiento:** informar a administración; no elegir otro dato solo para confirmar.
- **Producto terminado vencido:** permanece visible en stock físico, pero no puede venderse ni trasladarse a Estantería. Puede trasladarse entre los otros depósitos o salir por ajuste/merma.
- **Diferencia de stock:** informar producto, depósito, lote y cantidad observada. No volver a finalizar la orden ni duplicar ventas para corregirla.

Esta entrega gestiona productos terminados por lote y caja. Registrar un precio no crea una compra, una recepción ni stock de materias primas.

## Historial de movimientos

En **Depósitos → Movimientos** podés consultar los últimos 100 movimientos de cajas y salidas. Los traslados ya están confirmados al registrar los dos responsables; no quedan como una solicitud pendiente. En **Consultar historial anterior** se conservan los movimientos del circuito previo, solo para lectura. No los uses para registrar operaciones nuevas.

## Productos terminados vencidos

El stock muestra las unidades físicas y distingue las vigentes de las vencidas. La venta solo usa lotes vigentes, aunque haya más unidades físicas en el depósito. Los traslados a **Estantería** también seleccionan únicamente cajas de lotes vigentes; mover vencidos entre otros depósitos o retirarlos de Estantería hacia otro depósito sigue permitido. **Ajuste / merma** permite retirar unidades vencidas y conserva el criterio FIFO del circuito actual.

La condición se controla con la fecha y hora de vencimiento registradas en el lote. No modifica ni borra existencias automáticamente. Esta regla corresponde a producto terminado; no a lotes de compra de insumos.
