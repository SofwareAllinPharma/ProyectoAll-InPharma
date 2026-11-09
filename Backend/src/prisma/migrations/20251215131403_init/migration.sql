/*
  Warnings:

  - Made the column `mailUsuarioCreador` on table `PEDIDOS` required. This step will fail if there are existing NULL values in that column.
  - Made the column `idPerfilCreador` on table `PEDIDOS` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."PEDIDOS" DROP CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey";

-- AlterTable
ALTER TABLE "public"."PEDIDOS" ALTER COLUMN "mailUsuarioCreador" SET NOT NULL,
ALTER COLUMN "idPerfilCreador" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey" FOREIGN KEY ("mailUsuarioCreador", "idPerfilCreador") REFERENCES "public"."USUARIOxPERFIL"("mail", "idPerfil") ON DELETE RESTRICT ON UPDATE CASCADE;
