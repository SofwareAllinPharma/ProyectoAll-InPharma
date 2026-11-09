-- Las fórmulas reutilizables se pueden asignar concurrentemente a distintos productos.
-- Solo la composición propia necesita exclusión para registrar su pertenencia.
CREATE OR REPLACE FUNCTION asignar_composicion_propia_producto() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE composicion "FORMULA"%ROWTYPE;
BEGIN
  SELECT * INTO composicion FROM "FORMULA" WHERE "id" = NEW."idFormula";
  IF composicion."tipoComposicion" = 'producto' THEN
    SELECT * INTO composicion FROM "FORMULA" WHERE "id" = NEW."idFormula" FOR UPDATE;
    IF composicion."propietarioProductoId" IS NOT NULL
       AND composicion."propietarioProductoId" <> NEW."idProducto" THEN
      RAISE EXCEPTION 'La composición propia pertenece a otro producto';
    END IF;
    IF composicion."propietarioProductoId" IS NULL THEN
      UPDATE "FORMULA" SET "propietarioProductoId" = NEW."idProducto"
        WHERE "id" = composicion."id";
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
