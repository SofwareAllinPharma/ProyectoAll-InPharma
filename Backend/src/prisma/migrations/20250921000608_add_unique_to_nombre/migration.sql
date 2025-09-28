/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `Insumos` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Insumos_nombre_key" ON "public"."Insumos"("nombre");
