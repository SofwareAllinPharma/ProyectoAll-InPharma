-- CreateTable
CREATE TABLE "public"."MOVIMIENTO_PRODUCTO" (
    "idMovimiento" SERIAL NOT NULL,
    "fechaHoraActualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idDepositoOrigen" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "idDepositoDestino" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "responsable" VARCHAR(255) NOT NULL,
    "observaciones" TEXT,
    "idTipoMovimiento" INTEGER NOT NULL,

    CONSTRAINT "MOVIMIENTO_PRODUCTO_pkey" PRIMARY KEY ("idMovimiento")
);

-- CreateTable
CREATE TABLE "public"."TIPOS_MOVIMIENTO" (
    "idTipoMovimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "referencia" VARCHAR(120) NOT NULL,

    CONSTRAINT "TIPOS_MOVIMIENTO_pkey" PRIMARY KEY ("idTipoMovimiento")
);

-- CreateTable
CREATE TABLE "public"."ESTADO_MOVIMIENTO" (
    "idEstadoMovimiento" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,

    CONSTRAINT "ESTADO_MOVIMIENTO_pkey" PRIMARY KEY ("idEstadoMovimiento")
);

-- CreateTable
CREATE TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" (
    "idCambioEstadoMovimiento" SERIAL NOT NULL,
    "idEstadoMovimiento" INTEGER NOT NULL,
    "fechaHoraInicio" TIMESTAMP(3) NOT NULL,
    "fechaHoraFin" TIMESTAMP(3),
    "idMovimiento" INTEGER NOT NULL,

    CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_pkey" PRIMARY KEY ("idCambioEstadoMovimiento")
);

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idDepositoOrigen_idProducto_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idDepositoOrigen", "idProducto");

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idDepositoDestino_idProducto_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idDepositoDestino", "idProducto");

-- CreateIndex
CREATE INDEX "MOVIMIENTO_PRODUCTO_idTipoMovimiento_idx" ON "public"."MOVIMIENTO_PRODUCTO"("idTipoMovimiento");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_MOVIMIENTO_idEstadoMovimiento_idx" ON "public"."CAMBIO_ESTADO_MOVIMIENTO"("idEstadoMovimiento");

-- CreateIndex
CREATE INDEX "CAMBIO_ESTADO_MOVIMIENTO_idMovimiento_idx" ON "public"."CAMBIO_ESTADO_MOVIMIENTO"("idMovimiento");

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idDepositoOrigen_idProducto_fkey" FOREIGN KEY ("idDepositoOrigen", "idProducto") REFERENCES "public"."INVENTARIO"("idDeposito", "idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idDepositoDestino_idProducto_fkey" FOREIGN KEY ("idDepositoDestino", "idProducto") REFERENCES "public"."INVENTARIO"("idDeposito", "idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MOVIMIENTO_PRODUCTO" ADD CONSTRAINT "MOVIMIENTO_PRODUCTO_idTipoMovimiento_fkey" FOREIGN KEY ("idTipoMovimiento") REFERENCES "public"."TIPOS_MOVIMIENTO"("idTipoMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" ADD CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_idEstadoMovimiento_fkey" FOREIGN KEY ("idEstadoMovimiento") REFERENCES "public"."ESTADO_MOVIMIENTO"("idEstadoMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CAMBIO_ESTADO_MOVIMIENTO" ADD CONSTRAINT "CAMBIO_ESTADO_MOVIMIENTO_idMovimiento_fkey" FOREIGN KEY ("idMovimiento") REFERENCES "public"."MOVIMIENTO_PRODUCTO"("idMovimiento") ON DELETE RESTRICT ON UPDATE CASCADE;
