-- DropIndex
DROP INDEX "public"."PRODUCTOS_nombreComercial_key";

-- CreateIndex
CREATE INDEX "PRODUCTOS_nombreComercial_estaActivo_idx" ON "public"."PRODUCTOS"("nombreComercial", "estaActivo");
