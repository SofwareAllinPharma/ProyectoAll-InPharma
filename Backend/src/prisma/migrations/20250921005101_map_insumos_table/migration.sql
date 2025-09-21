/*
  Warnings:

  - You are about to drop the `Insumos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Insumos";

-- CreateTable
CREATE TABLE "public"."INSUMOS" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cal_100g" DOUBLE PRECISION NOT NULL,
    "grasasTotales_100g" DOUBLE PRECISION NOT NULL,
    "grasasTrans_100g" DOUBLE PRECISION NOT NULL,
    "grasasSaturadas_100g" DOUBLE PRECISION NOT NULL,
    "proteinas_100g" DOUBLE PRECISION NOT NULL,
    "carbohidratos_100g" DOUBLE PRECISION NOT NULL,
    "sodio_100g" DOUBLE PRECISION NOT NULL,
    "fibra_100g" DOUBLE PRECISION NOT NULL,
    "otro_100g" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "INSUMOS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "INSUMOS_nombre_key" ON "public"."INSUMOS"("nombre");
