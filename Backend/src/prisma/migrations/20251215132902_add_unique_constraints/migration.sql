/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `FORMULA` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `INSUMOS` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombreComercial]` on the table `PRODUCTOS` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FORMULA_nombre_key" ON "public"."FORMULA"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "INSUMOS_nombre_key" ON "public"."INSUMOS"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "PRODUCTOS_nombreComercial_key" ON "public"."PRODUCTOS"("nombreComercial");
