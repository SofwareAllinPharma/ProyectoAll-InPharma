# Manual de usuario de All-In-Pharma

Edición del 9 de noviembre de 2026 · Administración, fábrica y punto de venta.

La aplicación organiza el catálogo, las órdenes de producción y el stock de productos terminados. Este manual describe la versión revisada localmente. Los pasos marcados **Versión actualizada** requieren que esa función esté disponible en tu instalación. La entrega anterior de precios e inventario ya fue desplegada. La composición propia y las órdenes históricas requieren el despliegue de este paquete. [Estado del despliegue](../entregas/2026-11-09-estado-desplegado.md).

## Índice

- [Acceso, perfiles y resumen](#acceso-perfiles-y-resumen)
- [Catálogo, nutrición y etiquetas](#administrar-el-catálogo)
- [Proveedores y precios](#registrar-proveedores-y-precios)
- [Producción y exportación](#crear-y-seguir-una-orden)
- [Depósitos e inventario](#administrar-depósitos-y-alertas)
- [Ventas, ajustes e historial](#registrar-una-venta-o-una-salida)
- [Usuarios y soporte](#gestión-de-usuarios)

## Acceso, perfiles y resumen

1. Abrí AIP y elegí **Iniciar sesión**. Ingresá el correo y la contraseña de tu cuenta. [Abrir AIP](https://allinpharma.farmaceuticosasociados.com/auth/login).
2. Si tenés varios perfiles, elegí el que corresponda a la tarea. Desde el menú de usuario podés volver a **Perfiles**. En **Mis Datos** se consultan el nombre, correo y roles asignados.
3. Si olvidaste la contraseña, usá la opción de recuperación en el ingreso. Revisá el correo y seguí el enlace para guardar una nueva contraseña. Si no llega, verificá correo no deseado y consultá con Administración.
4. Usá **Cerrar sesión** al terminar, especialmente en una computadora compartida.

| Perfil | Menú y tareas principales |
| --- | --- |
| Administración de sistema | Resumen, catálogo completo, Pedidos, Depósitos y Gestión de Usuarios. |
| Administración de fábrica | Resumen, catálogo, Pedidos y Depósitos. Mantiene insumos, fórmulas, productos, proveedores y precios. |
| Técnico | Resumen, Fórmulas, Productos, Pedidos y Depósitos. Consulta recetas y opera órdenes y stock según las acciones habilitadas. |
| Encargado de punto de venta | Punto de Venta, Movimientos y Depósitos. Consulta existencias y registra movimientos de stock según su perfil. |

**Resumen** muestra indicadores y accesos según el perfil. Usalo para detectar órdenes a revisar, producción y alertas de inventario. Abrí el detalle del pedido o depósito para confirmar el estado antes de actuar. Si falta una opción, verificá el perfil seleccionado y pedí a Administración que revise tus asignaciones.

## Recorrido de trabajo

**Consultar producto y fórmula → crear orden → elaborar → registrar lote y cajas en Atrás → trasladar a Intermedio → trasladar a Estantería → vender.**

Estantería es el depósito de venta. El stock que todavía está en Atrás o Intermedio debe trasladarse antes de venderse.

## Administrar el catálogo

### Alta, edición y baja de insumos

En **Insumos**, buscá el nombre antes de dar un alta. Para agregarlo, completá nombre, alias si aplica y datos nutricionales por 100 g según su ficha. Usá **Editar** desde el menú de la fila para corregir datos. Revisá fórmulas y productos afectados si cambia un valor nutricional. La baja retira el insumo del catálogo activo y puede rechazarse si está vinculado a fórmulas activas.

### Fórmulas

En **Fórmulas** podés buscar por nombre, filtrar y abrir **Consultar** para ver ingredientes, nutrición y costo. Administración puede crear una fórmula indicando nombre y gramos de cada insumo por porción. Revisá la porción y los totales calculados antes de guardar. Usá **Copiar** cuando necesites partir de una receta existente. Una fórmula protegida restringe cambios de receta y baja. Si el sistema rechaza una baja por productos asociados, revisá esos vínculos antes de volver a intentar.

### Productos y etiquetas

En **Productos**, buscá por nombre y abrí la ficha para consultar composición, presentación, nutrición y costo. Para el alta o edición, Administración selecciona una fórmula reutilizable y completa nombre comercial, peso neto o porciones por envase, SKU y días de vencimiento cuando correspondan. Verificá que peso, porciones y fecha de vencimiento de trabajo sean coherentes. La opción de eliminar depende de las asociaciones del producto. Si hay existencias u órdenes asociadas, consultá con Administración antes de gestionar su baja.

Desde la ficha nutricional, usá la acción **Imprimir Etiqueta** cuando esté disponible y elegí el formato de descarga. Revisá nombre, peso, porción y valores antes de imprimir. Si hay información faltante, completá o verificá la ficha de origen con Administración.

**Versión actualizada.** También se puede [crear un producto desde insumos propios](#productos-con-ingredientes-propios-y-órdenes-históricas).

### Consultar un insumo

1. Entrá a **Insumos** y buscá por nombre.
2. Abrí el menú de tres puntos de la fila y elegí la consulta de ficha.
3. Revisá su identificación y los valores nutricionales: están expresados **por 100 g de insumo**.
4. Si tu perfil permite consultar precios, también vas a ver el proveedor de referencia, el precio en **ARS/kg**, su vigencia y el historial.

Si aparece **Pendiente de carga**, falta registrar un precio. Si aparece un error de consulta, volvé a abrir la ficha; no lo interpretes como ausencia de precio.

Elegir otro proveedor para el precio no modifica la nutrición ni la receta del insumo.

## Registrar proveedores y precios

**Versión actualizada.** Las fichas ampliadas y el historial de referencias requieren la entrega de precios.

Estas acciones corresponden a administración de fábrica o de sistema.

### Proveedor

1. Entrá a **Proveedores**.
2. Buscá por nombre, razón social o CUIT para comprobar si ya existe.
3. Si falta, elegí **Nuevo proveedor** y completá los datos disponibles.
4. Desde la consulta de su ficha podés revisar sus insumos con referencia vigente y las referencias anteriores.

Que un insumo figure en esta ficha significa que tiene un precio asociado a ese proveedor. No indica que se haya realizado una compra ni que el proveedor tenga mercadería disponible.

Desde el menú de la fila podés editar los datos de contacto e identificación o solicitar la baja. Si el proveedor tiene precios vigentes, cargá primero las referencias de reemplazo que correspondan. Las anteriores siguen en el historial.

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

## Crear y seguir una orden

1. Desde **Pedidos → Órdenes de Producción**, Administración abre el formulario de alta y selecciona el producto.
2. Indicá la cantidad a producir en gramos, paquetes o porciones según la unidad que uses. Revisá la conversión a las otras unidades y agregá observaciones si corresponde.
3. Guardá y abrí el detalle para verificar el número, el estado y los insumos requeridos. Los filtros del listado ayudan a ubicar órdenes por estado.
4. Usá **Tomar Pedido** cuando esté habilitado para iniciar la elaboración. Consultá el historial para ver los cambios y responsables.
5. Si se suspende una orden todavía cancelable, usá **Cancelar Pedido** desde el menú habilitado. Antes de confirmar, verificá el número y el estado. Una orden ya elaborada requiere revisar el lote y el inventario con Administración.

Las acciones dependen del estado, perfil y versión. Si una acción está ausente o el estado cambió, actualizá el detalle y verificá con Administración antes de crear otra orden.

## Descargar la orden de producción

1. Entrá a **Órdenes/Pedidos** y abrí el detalle de la orden.
2. Verificá producto, fórmula, cantidades e insumos requeridos.
3. Elegí **Exportar → Descargar PDF** o **Descargar Word**.
4. Revisá el documento antes de imprimir o usarlo para elaborar.

La exportación incluye fórmula, porción, nutrición, cantidades, composición requerida, responsables registrados e historial. El PDF numera sus páginas y repite los encabezados de composición cuando continúa en otra página.

**Versión actualizada.** Cuando el detalle indica que la composición fue registrada con la orden, la exportación usa esa copia. En versiones anteriores y órdenes sin copia, reimprimir puede mostrar la composición actual del producto. Las cantidades de insumos representan requerimientos estimados.

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

## Administrar depósitos y alertas

En **Depósitos** podés abrir cada ficha para consultar responsable, capacidad, stock y movimientos. Administración puede crear o modificar depósitos con los datos del lugar. Antes de desactivar o cambiar el nombre de un depósito, verificá existencias y coordiná el cambio con el responsable. Fábrica-Atrás, Intermedio y Estantería identifican las etapas del circuito.

Desde el menú de la ficha, **Configurar umbrales** permite definir mínimos por producto para las alertas. Revisá el depósito, el producto y su cantidad física antes de tomar una decisión a partir de una alerta. En Punto de Venta, **Depósitos** permite consultar existencias y **Movimientos** abre el historial.

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

**Versión actualizada.** Este bloqueo automático forma parte de la entrega de inventario. Verificá la vigencia física del lote antes de usarlo.

El stock muestra las unidades físicas y distingue las vigentes de las vencidas. La venta solo usa lotes vigentes, aunque haya más unidades físicas en el depósito. Los traslados a **Estantería** también seleccionan únicamente cajas de lotes vigentes; mover vencidos entre otros depósitos o retirarlos de Estantería hacia otro depósito sigue permitido. **Ajuste / merma** permite retirar unidades vencidas y conserva el criterio FIFO del circuito actual.

La condición se controla con la fecha y hora de vencimiento registradas en el lote. No modifica ni borra existencias automáticamente. Esta regla corresponde a producto terminado; no a lotes de compra de insumos.

## Productos con ingredientes propios y órdenes históricas

**Versión actualizada.** Funciones verificadas en la versión local del 8 de noviembre.

En Productos, elegí **Fórmula reutilizable** para usar una receta del catálogo o **Insumos del producto** para cargar ingredientes directamente. Indicá los gramos de cada insumo por porción y el peso del envase o sus porciones. Por ejemplo, 10 g + 30 g por porción y 2,5 porciones forman un envase de 100 g. La ficha calcula nutrición y costo con las mismas reglas en ambos casos. Un precio faltante deja el costo incompleto.

Al editar ingredientes propios se guarda una nueva composición del producto. Esa composición no aparece entre las fórmulas reutilizables. Las recetas protegidas mantienen protegidos sus ingredientes; se puede editar la presentación del producto.

Las órdenes nuevas guardan la composición, nutrición y presentación al crearse. El detalle, PDF, Word y cierre usan esa copia aunque después se edite el catálogo. Las órdenes anteriores a esta actualización muestran un aviso: usan la composición actual disponible, ya que no se puede reconstruir su receta histórica con certeza.

Los costos siguen disponibles para usuarios autenticados. Se mantienen los perfiles actuales; Administración gestiona las asignaciones. Los permisos del servidor reflejan cambios de perfil o bajas de cuenta en la siguiente petición.


## Gestión de usuarios

Solo **Administración de sistema** dispone de **Gestión de Usuarios**.

1. Buscá por nombre, apellido o correo para verificar si ya existe una cuenta.
2. En **Registrar Nuevo Usuario**, completá nombre, apellido, DNI, correo y teléfono. Ingresá una contraseña y su confirmación. El formulario pide al menos seis caracteres con letras y números.
3. Seleccioná uno o más perfiles necesarios para el trabajo y guardá. El alta habitual ofrece perfiles operativos. Para una cuenta de administración del sistema, consultá al responsable técnico.
4. Para cambiar datos o perfiles, abrí **Editar** desde la cuenta existente. Para suspender o restituir acceso, usá **Desactivar** o **Reactivar** y revisá el resultado en la lista.

## Informar una incidencia

Registrá la fecha, el perfil, la pantalla, la acción y el mensaje recibido. Si aplica, incluí número de orden, lote, producto, depósito y cantidad. Si una confirmación quedó sin respuesta, consultá primero el estado y el historial antes de repetir la operación. Compartí capturas por el canal interno sin contraseñas ni datos innecesarios.

Para configuración y control de puesta en marcha, consultá la [guía de administración](guia-administracion-aip.md).
