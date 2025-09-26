-- CreateTable
CREATE TABLE "public"."Formula" (
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

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormulaInsumo" (
    "id" SERIAL NOT NULL,
    "idFormula" INTEGER NOT NULL,
    "idInsumo" INTEGER NOT NULL,
    "cantidadInsumo" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "FormulaInsumo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Formula_nombre_key" ON "public"."Formula"("nombre");

-- AddForeignKey
ALTER TABLE "public"."FormulaInsumo" ADD CONSTRAINT "FormulaInsumo_idFormula_fkey" FOREIGN KEY ("idFormula") REFERENCES "public"."Formula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaInsumo" ADD CONSTRAINT "FormulaInsumo_idInsumo_fkey" FOREIGN KEY ("idInsumo") REFERENCES "public"."INSUMOS"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
