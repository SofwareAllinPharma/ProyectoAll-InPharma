-- ============================================================
-- SCRIPT DE LIMPIEZA PRODUCCIÓN - All-In Pharma
-- Ejecutar en la consola de Postgres de Dokploy
-- RESPETAR EL ORDEN (FK constraints)
-- ============================================================

-- ── 1. LIMPIAR MOVIMIENTOS ───────────────────────────────────
-- Primero los hijos (CAMBIO_ESTADO_MOVIMIENTO), luego el padre
DELETE FROM "CAMBIO_ESTADO_MOVIMIENTO";
DELETE FROM "MOVIMIENTO_PRODUCTO";

-- ── 2. LIMPIAR PEDIDOS ──────────────────────────────────────
-- Romper FK circular antes de borrar
UPDATE "PEDIDOS" SET "idCambioEstadoPedido" = NULL;
DELETE FROM "CAMBIO_ESTADO_PEDIDO";
DELETE FROM "PEDIDOS";

-- ── 3. RESETEAR STOCK EN INVENTARIO ─────────────────────────
UPDATE "INVENTARIO"
SET "cantidadProducto" = 0,
    "updatedAt"        = NOW();

-- Resetear capacidad usada en depósitos también
UPDATE "DEPOSITOS"
SET "capacidadUsada" = 0;

-- ── 4. PERMISOS MILI ────────────────────────────────────────
-- Perfiles disponibles: 1=tecnico, 2=adminfab, 3=adminsis, 4=encptoventa

-- Primero verificá que el usuario exista:
SELECT mail, activo FROM "USUARIO" WHERE mail = 'mili@gmail.com';

-- Si NO existe, crealo (reemplazá el hash o usá la contraseña del seed):
-- INSERT INTO "USUARIO" (mail, "contraseña", activo)
-- VALUES ('mili@gmail.com', '$2b$10_HASH_ACA', true)
-- ON CONFLICT (mail) DO NOTHING;

-- Asignar perfil adminsis (id=3):
INSERT INTO "USUARIOxPERFIL" (mail, "idPerfil")
VALUES ('mili@gmail.com', 3)
ON CONFLICT (mail, "idPerfil") DO NOTHING;

-- ── 5. VERIFICACIÓN FINAL ────────────────────────────────────
SELECT 'movimientos'  AS tabla, COUNT(*) FROM "MOVIMIENTO_PRODUCTO"
UNION ALL
SELECT 'pedidos',               COUNT(*) FROM "PEDIDOS"
UNION ALL
SELECT 'inventario_con_stock',  COUNT(*) FROM "INVENTARIO" WHERE "cantidadProducto" > 0;

-- Permisos de mili:
SELECT u.mail, p.nombre AS perfil
FROM "USUARIOxPERFIL" up
JOIN "USUARIO" u ON u.mail = up.mail
JOIN "PERFIL"  p ON p.id   = up."idPerfil"
WHERE u.mail = 'mili@gmail.com';
