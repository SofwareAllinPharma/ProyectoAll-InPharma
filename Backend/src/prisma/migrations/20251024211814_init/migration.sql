/*
  Warnings:

  - You are about to drop the column `referencia` on the `TIPOS_MOVIMIENTO` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ALTER COLUMN "idDepositoDestino" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."TIPOS_MOVIMIENTO" DROP COLUMN "referencia";
