/*
  Warnings:

  - You are about to drop the `Formula` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FormulaInsumo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."FormulaInsumo" DROP CONSTRAINT "FormulaInsumo_idFormula_fkey";

-- DropForeignKey
ALTER TABLE "public"."FormulaInsumo" DROP CONSTRAINT "FormulaInsumo_idInsumo_fkey";

-- DropTable
DROP TABLE "public"."Formula";

-- DropTable
DROP TABLE "public"."FormulaInsumo";

-- CreateTable
CREATE TABLE "public"."FORMULA" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "porcion" DOUBLE PRECISION NOT NULL,
    "kcalorias" DOUBLE PRECISION NOT NULL,
    "kjuls" DOUBLE PRECISION NOT NULL,
    "grasaTotal" DOUBLE PRECISION NOT NULL,
    "grasaTrans" DOUBLE PRECISION NOT NULL,
    "grasaSaturada" DOUBLE PRECISION NOT NULL,
    "proteinas" DOUBLE PRECISION NOT NULL,
    "carbohidratos" DOUBLE PRECISION NOT NULL,
    "sodio" DOUBLE PRECISION NOT NULL,
    "fibra" DOUBLE PRECISION NOT NULL,
    "otros" DOUBLE PRECISION NOT NULL,
    "esProtegida" BOOLEAN NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FORMULA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FORMULAINSUMO" (
    "id" SERIAL NOT NULL,
    "idFormula" INTEGER NOT NULL,
    "idInsumo" INTEGER NOT NULL,
    "cantidadInsumo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FORMULAINSUMO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FORMULA_nombre_key" ON "public"."FORMULA"("nombre");

-- AddForeignKey
ALTER TABLE "public"."FORMULAINSUMO" ADD CONSTRAINT "FORMULAINSUMO_idFormula_fkey" FOREIGN KEY ("idFormula") REFERENCES "public"."FORMULA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FORMULAINSUMO" ADD CONSTRAINT "FORMULAINSUMO_idInsumo_fkey" FOREIGN KEY ("idInsumo") REFERENCES "public"."INSUMOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
