-- CreateTable
CREATE TABLE "public"."PRODUCTOS" (
    "idProducto" SERIAL NOT NULL,
    "idFormula" INTEGER NOT NULL,
    "nombreComercial" TEXT NOT NULL,
    "pesoNeto" DOUBLE PRECISION NOT NULL,
    "cantPorcionesAportadas" INTEGER NOT NULL,
    "estaActivo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PRODUCTOS_pkey" PRIMARY KEY ("idProducto")
);

-- CreateIndex
CREATE UNIQUE INDEX "PRODUCTOS_nombreComercial_key" ON "public"."PRODUCTOS"("nombreComercial");

-- AddForeignKey
ALTER TABLE "public"."PRODUCTOS" ADD CONSTRAINT "PRODUCTOS_idFormula_fkey" FOREIGN KEY ("idFormula") REFERENCES "public"."FORMULA"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
