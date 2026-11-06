-- No resuelve duplicados automáticamente: si existen, detener y revisar con Administración.
-- Conserva todos los registros y vigencias; el servicio serializa cargas por insumo.
CREATE UNIQUE INDEX "PRECIO_INSUMO_unico_vigente"
ON "PRECIO_INSUMO" ("idInsumo") WHERE "activo" = true;
