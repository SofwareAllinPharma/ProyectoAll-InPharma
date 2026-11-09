-- AlterTable
ALTER TABLE "PRODUCTOS" ADD COLUMN     "diasVencimiento" INTEGER;

-- CreateTable
CREATE TABLE "LOTE" (
    "id" SERIAL NOT NULL,
    "numeroLote" VARCHAR(64) NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "idPedido" INTEGER,
    "fechaElaboracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LOTE_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAJA" (
    "id" SERIAL NOT NULL,
    "idLote" INTEGER NOT NULL,
    "idDeposito" INTEGER NOT NULL,
    "unidades" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CAJA_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LOTE_numeroLote_key" ON "LOTE"("numeroLote");

-- CreateIndex
CREATE UNIQUE INDEX "LOTE_idPedido_key" ON "LOTE"("idPedido");

-- CreateIndex
CREATE INDEX "LOTE_idProducto_idx" ON "LOTE"("idProducto");

-- CreateIndex
CREATE INDEX "LOTE_fechaElaboracion_idx" ON "LOTE"("fechaElaboracion");

-- CreateIndex
CREATE INDEX "CAJA_idLote_idx" ON "CAJA"("idLote");

-- CreateIndex
CREATE INDEX "CAJA_idDeposito_idx" ON "CAJA"("idDeposito");

-- AddForeignKey
ALTER TABLE "LOTE" ADD CONSTRAINT "LOTE_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LOTE" ADD CONSTRAINT "LOTE_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "PEDIDOS"("numPedido") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAJA" ADD CONSTRAINT "CAJA_idLote_fkey" FOREIGN KEY ("idLote") REFERENCES "LOTE"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAJA" ADD CONSTRAINT "CAJA_idDeposito_fkey" FOREIGN KEY ("idDeposito") REFERENCES "DEPOSITOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
