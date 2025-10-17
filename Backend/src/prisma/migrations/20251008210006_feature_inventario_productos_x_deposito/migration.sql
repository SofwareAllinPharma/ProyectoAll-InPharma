-- CreateTable
CREATE TABLE "public"."INVENTARIO" (
    "idDeposito" INTEGER NOT NULL,
    "idProducto" INTEGER NOT NULL,
    "cantidadProducto" INTEGER NOT NULL DEFAULT 0,
    "umbralMin" INTEGER NOT NULL DEFAULT 0,
    "umbralMax" INTEGER,

    CONSTRAINT "INVENTARIO_pkey" PRIMARY KEY ("idDeposito","idProducto")
);

-- CreateIndex
CREATE INDEX "INVENTARIO_idDeposito_idx" ON "public"."INVENTARIO"("idDeposito");

-- CreateIndex
CREATE INDEX "INVENTARIO_idProducto_idx" ON "public"."INVENTARIO"("idProducto");

-- AddForeignKey
ALTER TABLE "public"."INVENTARIO" ADD CONSTRAINT "INVENTARIO_idDeposito_fkey" FOREIGN KEY ("idDeposito") REFERENCES "public"."DEPOSITOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."INVENTARIO" ADD CONSTRAINT "INVENTARIO_idProducto_fkey" FOREIGN KEY ("idProducto") REFERENCES "public"."PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;
