-- DropForeignKey
ALTER TABLE "public"."PEDIDOS" DROP CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey";

-- AlterTable
ALTER TABLE "PEDIDOS" ALTER COLUMN "mailUsuarioCreador" DROP NOT NULL,
ALTER COLUMN "idPerfilCreador" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey" FOREIGN KEY ("mailUsuarioCreador", "idPerfilCreador") REFERENCES "USUARIOxPERFIL"("mail", "idPerfil") ON DELETE SET NULL ON UPDATE CASCADE;
