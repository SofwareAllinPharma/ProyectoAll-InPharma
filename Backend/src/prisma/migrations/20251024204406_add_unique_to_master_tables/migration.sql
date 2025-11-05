/*
  Warnings:

  - A unique constraint covering the columns `[nombre]` on the table `ESTADO_MOVIMIENTO` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nombre]` on the table `TIPOS_MOVIMIENTO` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ESTADO_MOVIMIENTO_nombre_key" ON "public"."ESTADO_MOVIMIENTO"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "TIPOS_MOVIMIENTO_nombre_key" ON "public"."TIPOS_MOVIMIENTO"("nombre");
