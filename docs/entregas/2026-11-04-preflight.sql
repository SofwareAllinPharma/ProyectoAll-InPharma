-- SOLO LECTURA. Ejecutar en una copia restaurada y luego, con autorización, en el destino de deploy.
-- No ejecutar semillas, limpieza_produccion.sql, db:sync ni resets.
BEGIN READ ONLY;
SELECT current_database() AS base, current_setting('server_version') AS version;

-- Deben existir activos los tres nombres operativos. Revisar ausencia/duplicados similares manualmente.
SELECT "id", "nombre", "estado" FROM "DEPOSITOS"
WHERE "nombre" IN ('Fábrica-Atrás', 'Intermedio', 'Estantería', 'Estanteria') ORDER BY "id";

-- Debe devolver cero filas antes del índice único. No desactivar ni borrar automáticamente.
SELECT "idInsumo", count(*) AS precios_vigentes
FROM "PRECIO_INSUMO" WHERE "activo" = true GROUP BY "idInsumo" HAVING count(*) > 1;

-- Este stock se conserva pero ya no se usa como saldo de la UI. Conciliar contra cajas/conteo físico.
SELECT "idDeposito", count(*) AS filas_legacy_no_cero, sum("cantidadProducto") AS unidades_legacy
FROM "INVENTARIO" WHERE "cantidadProducto" <> 0 GROUP BY "idDeposito" ORDER BY "idDeposito";
SELECT "idDeposito", count(*) AS cajas, sum("unidades") AS unidades_cajas
FROM "CAJA" WHERE "unidades" > 0 GROUP BY "idDeposito" ORDER BY "idDeposito";

-- Movimientos anteriores en curso: resolver con responsables antes de pasar el histórico a consulta.
SELECT c."idMovimiento", e."nombre" AS estado
FROM "CAMBIO_ESTADO_MOVIMIENTO" c
JOIN "ESTADO_MOVIMIENTO" e ON e."idEstadoMovimiento" = c."idEstadoMovimiento"
WHERE c."fechaHoraFin" IS NULL AND e."nombre" IN ('CREADO', 'EN_CAMINO');

-- Órdenes que no podrán finalizar hasta completar datos reales.
SELECT "idProducto", "diasVencimiento" FROM "PRODUCTOS"
WHERE "estaActivo" = true AND ("diasVencimiento" IS NULL OR "diasVencimiento" <= 0);

-- Físico vencido: permanece visible; no vendible ni transferible a Estantería. No sumarlo al stock vendible.
SELECT c."idDeposito", count(*) AS cajas_vencidas, sum(c."unidades") AS unidades_vencidas
FROM "CAJA" c JOIN "LOTE" l ON l."id" = c."idLote"
WHERE c."unidades" > 0 AND l."fechaVencimiento" < CURRENT_TIMESTAMP
GROUP BY c."idDeposito";
COMMIT;
