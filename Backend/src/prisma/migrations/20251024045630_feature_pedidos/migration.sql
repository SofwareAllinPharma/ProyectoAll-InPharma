-- CreateTable
CREATE TABLE "ESTADO_PEDIDO" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ESTADO_PEDIDO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CAMBIO_ESTADO_PEDIDO" (
    "idCambioEstado" SERIAL NOT NULL,
    "idPedido" INTEGER NOT NULL,
    "idEstadoPedido" INTEGER NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),

    CONSTRAINT "CAMBIO_ESTADO_PEDIDO_pkey" PRIMARY KEY ("idCambioEstado")
);

-- CreateTable
CREATE TABLE "PEDIDOS" (
    "numPedido" SERIAL NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantAProducir_gramos" DOUBLE PRECISION NOT NULL,
    "cantAProducir_paquetes" DOUBLE PRECISION NOT NULL,
    "cantAProducir_porciones" DOUBLE PRECISION NOT NULL,
    "observacion" TEXT,
    "idCambioEstadoPedido" INTEGER,
    "mailUsuarioCreador" TEXT NOT NULL,
    "idPerfilCreador" INTEGER NOT NULL,
    "mailUsuarioCocinero" TEXT,
    "idPerfilCocinero" INTEGER,
    "estaAsignado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PEDIDOS_pkey" PRIMARY KEY ("numPedido")
);

-- CreateIndex
CREATE INDEX "ESTADO_PEDIDO_nombre_idx" ON "ESTADO_PEDIDO"("nombre");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_PEDIDO_idPedido_idx" ON "CAMBIO_ESTADO_PEDIDO"("idPedido");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_PEDIDO_idEstadoPedido_idx" ON "CAMBIO_ESTADO_PEDIDO"("idEstadoPedido");

-- CreateIndex
CREATE UNIQUE INDEX "PEDIDOS_idCambioEstadoPedido_key" ON "PEDIDOS"("idCambioEstadoPedido");

-- CreateIndex
CREATE INDEX "PEDIDOS_estaAsignado_createdAt_idx" ON "PEDIDOS"("estaAsignado", "createdAt");

-- CreateIndex
CREATE INDEX "PEDIDOS_idProducto_idx" ON "PEDIDOS"("idProducto");

-- CreateIndex
CREATE INDEX "PEDIDOS_mailUsuarioCreador_idPerfilCreador_idx" ON "PEDIDOS"("mailUsuarioCreador", "idPerfilCreador");

-- CreateIndex
CREATE INDEX "PEDIDOS_mailUsuarioCocinero_idPerfilCocinero_idx" ON "PEDIDOS"("mailUsuarioCocinero", "idPerfilCocinero");

-- CreateIndex
CREATE INDEX "FORMULA_nombre_activo_idx" ON "FORMULA"("nombre", "activo");

-- AddForeignKey
ALTER TABLE "CAMBIO_ESTADO_PEDIDO" ADD CONSTRAINT "CAMBIO_ESTADO_PEDIDO_idPedido_fkey" FOREIGN KEY ("idPedido") REFERENCES "PEDIDOS"("numPedido") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CAMBIO_ESTADO_PEDIDO" ADD CONSTRAINT "CAMBIO_ESTADO_PEDIDO_idEstadoPedido_fkey" FOREIGN KEY ("idEstadoPedido") REFERENCES "ESTADO_PEDIDO"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_idCambioEstadoPedido_fkey" FOREIGN KEY ("idCambioEstadoPedido") REFERENCES "CAMBIO_ESTADO_PEDIDO"("idCambioEstado") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCreador_idPerfilCreador_fkey" FOREIGN KEY ("mailUsuarioCreador", "idPerfilCreador") REFERENCES "USUARIOxPERFIL"("mail", "idPerfil") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_mailUsuarioCocinero_idPerfilCocinero_fkey" FOREIGN KEY ("mailUsuarioCocinero", "idPerfilCocinero") REFERENCES "USUARIOxPERFIL"("mail", "idPerfil") ON DELETE SET NULL ON UPDATE CASCADE;
