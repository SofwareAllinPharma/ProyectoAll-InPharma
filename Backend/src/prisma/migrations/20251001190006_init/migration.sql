-- CreateTable
CREATE TABLE "public"."DEPOSITOS" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "responsable" TEXT NOT NULL,
    "capacidadTotal" INTEGER NOT NULL,

    CONSTRAINT "DEPOSITOS_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DEPOSITOS_nombre_key" ON "public"."DEPOSITOS"("nombre");
