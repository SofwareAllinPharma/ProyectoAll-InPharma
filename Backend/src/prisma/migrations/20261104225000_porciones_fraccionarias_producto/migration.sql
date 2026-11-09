-- La UI y el servicio ya calculan porciones fraccionarias; conservar todos los valores existentes.
ALTER TABLE "PRODUCTOS" ALTER COLUMN "cantPorcionesAportadas" TYPE DOUBLE PRECISION
USING "cantPorcionesAportadas"::double precision;
