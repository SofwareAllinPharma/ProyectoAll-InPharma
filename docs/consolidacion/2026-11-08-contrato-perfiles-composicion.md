# Perfiles reales y composición propia de productos

Fecha 2026-11-08. Juani autorizó implementar el próximo paquete y confirmó mantener la visibilidad actual de costos y corregir primero los perfiles existentes.

## Resultado

- La sesión recibe las asignaciones reales de perfil. Las pantallas y los pedidos usan esos IDs y rechazan usuarios inexistentes/inactivos.
- Producto se crea desde fórmula reutilizable o ingredientes propios por porción. Ambas opciones conservan nutrición, peso, porciones y costo.
- La composición propia tiene clase y pertenencia explícitas. Los cambios de ingredientes crean otra composición. Una fórmula compartida protegida mantiene protegida su receta y permite editar presentación/metadatos del producto.
- Una orden nueva guarda una copia de producto, composición, nutrientes y presentación al crearse. Consulta, PDF/Word y cálculo de cantidades reales usan esa copia. Las órdenes anteriores continúan identificando su fuente de composición actual disponible.

## Persistencia

Migración aditiva local. Fórmulas existentes clasificadas reutilizables, sin recalcular datos. Fórmula propia pertenece a un único producto a través de toda su historia, protegido por trigger transaccional. Pedido guarda JSON de composición/presentación y momento de captura. Snapshot existente es inmutable. Las órdenes anteriores conservan snapshot nulo.

La captura bloquea producto y fórmula dentro de la transacción. Si cambió la presentación o la fórmula entre selección/cálculo y guardado, el servidor pide actualizar antes de confirmar. Los insumos y la composición son copias de los datos registrados, con sus unidades originales. El costo de referencia sigue consultándose por precio vigente y no se presenta como costo comprado histórico de la orden.

## Aceptación

1. Perfiles con IDs arbitrarios permiten iniciar sesión y crear/tomar pedidos usando las asignaciones reales. Una cuenta inactiva pierde acceso a endpoints autenticados.
2. Producto directo de10g+30g por porción y2.5porciones guarda100g y nutrición/costo coherentes. Sin precio conserva costo incompleto.
3. Líneas duplicadas, cantidades inválidas, insumos inactivos y fallos intermedios revierten el alta completa. Las composiciones propias no aparecen como fórmulas reutilizables ni se comparten entre productos.
4. Editar producto directo permite cambiar ingredientes creando una revisión nueva. Las fórmulas reutilizables y el camino previo siguen disponibles.
5. Crear orden y después modificar receta/presentación mantiene el documento, requerimientos y cierre de esa orden con la copia guardada.
6. Las órdenes anteriores muestran explícitamente la limitación de usar composición actual al imprimir.

Validación en PostgreSQL temporal, API y navegador. La ejecución remota y el alcance de la entrega anterior se tratan en sus propios registros.

## Validación ejecutada y límites

- TypeScript backend y build frontend: PASS.
- Integración PostgreSQL local aislado: 32 pruebas reportadas, todas PASS. Incluye pertenencia de composición, inmutabilidad de órdenes, concurrencia, perfiles, inventario, precios y reversión completa ante fallo del recálculo nutricional.
- Pruebas frontend: 11 PASS, incluyendo PDF/Word, composición directa y selección histórica. Pruebas unitarias de sesión/composición: 12 PASS.
- Navegador local: alta directa, detalle histórico, descarga PDF y selector móvil comprobados. Evidencia temporal en `/private/tmp/aip-consolidacion-browser/`.
- Edición de insumos y recálculo se confirman en una misma transacción. Un bloqueo asesor de catálogo coordina esa operación con crear/editar composiciones y capturar órdenes; evita combinar ingredientes nuevos con totales anteriores. Cantidades no finitas o desbordadas se rechazan.
- Dos migraciones nuevas de noviembre 8 aplicadas únicamente en base sintética local. No se realizó push, merge ni deploy de este paquete. Sigue pendiente conciliar stock real y ensayar migraciones en copia operativa antes de desplegar.
- Diff de código sin errores de espacios; `frontend/.env` conserva el cambio previo ajeno, cuyo CRLF genera una advertencia existente.
