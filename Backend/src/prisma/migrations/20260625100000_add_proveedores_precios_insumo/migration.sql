-- CreateTable
CREATE TABLE "PROVEEDOR" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(50),
    "email" VARCHAR(150),
    "cuit" VARCHAR(20),
    "razonSocial" VARCHAR(200),
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PROVEEDOR_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PRECIO_INSUMO" (
    "id" SERIAL NOT NULL,
    "idInsumo" INTEGER NOT NULL,
    "idProveedor" INTEGER NOT NULL,
    "precioPorKg" DOUBLE PRECISION NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaDesde" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaHasta" TIMESTAMP(3),
    "observacion" VARCHAR(300),

    CONSTRAINT "PRECIO_INSUMO_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PRECIO_INSUMO_idInsumo_activo_idx" ON "PRECIO_INSUMO"("idInsumo", "activo");

-- CreateIndex
CREATE INDEX "PRECIO_INSUMO_idProveedor_idx" ON "PRECIO_INSUMO"("idProveedor");

-- AddForeignKey
ALTER TABLE "PRECIO_INSUMO" ADD CONSTRAINT "PRECIO_INSUMO_idInsumo_fkey" FOREIGN KEY ("idInsumo") REFERENCES "INSUMOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PRECIO_INSUMO" ADD CONSTRAINT "PRECIO_INSUMO_idProveedor_fkey" FOREIGN KEY ("idProveedor") REFERENCES "PROVEEDOR"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
