-- CreateTable
CREATE TABLE "public"."Insumos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cal_100g" DOUBLE PRECISION NOT NULL,
    "grasasTotales_100g" DOUBLE PRECISION NOT NULL,
    "grasasTrans_100g" DOUBLE PRECISION NOT NULL,
    "grasasSaturadas_100g" DOUBLE PRECISION NOT NULL,
    "proteinas_100g" DOUBLE PRECISION NOT NULL,
    "carbohidratos_100g" DOUBLE PRECISION NOT NULL,
    "sodio_100g" DOUBLE PRECISION NOT NULL,
    "fibra_100g" DOUBLE PRECISION NOT NULL,
    "otro_100g" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Insumos_pkey" PRIMARY KEY ("id")
);
