ALTER TABLE "FORMULA"
  ADD COLUMN "tipoComposicion" TEXT NOT NULL DEFAULT 'reutilizable',
  ADD COLUMN "propietarioProductoId" INTEGER;
ALTER TABLE "FORMULA" ADD CONSTRAINT "FORMULA_propietarioProductoId_fkey"
  FOREIGN KEY ("propietarioProductoId") REFERENCES "PRODUCTOS"("idProducto") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FORMULA" ADD CONSTRAINT "FORMULA_tipoComposicion_check"
  CHECK ("tipoComposicion" IN ('reutilizable', 'producto') AND
    ("tipoComposicion" = 'producto' OR "propietarioProductoId" IS NULL));

-- La pertenencia se conserva aunque el producto adopte una composición más nueva.
CREATE FUNCTION asignar_composicion_propia_producto() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE composicion "FORMULA"%ROWTYPE;
BEGIN
  SELECT * INTO composicion FROM "FORMULA" WHERE "id" = NEW."idFormula" FOR UPDATE;
  IF composicion."tipoComposicion" = 'producto' THEN
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
CREATE TRIGGER "PRODUCTOS_asignar_composicion_propia"
  AFTER INSERT OR UPDATE OF "idFormula" ON "PRODUCTOS"
  FOR EACH ROW EXECUTE FUNCTION asignar_composicion_propia_producto();

CREATE FUNCTION proteger_clase_y_dueno_composicion() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW."tipoComposicion" IS DISTINCT FROM OLD."tipoComposicion" THEN
    RAISE EXCEPTION 'La clase de composición no se puede reclasificar';
  END IF;
  IF OLD."propietarioProductoId" IS NOT NULL AND
     NEW."propietarioProductoId" IS DISTINCT FROM OLD."propietarioProductoId" THEN
    RAISE EXCEPTION 'La pertenencia de una composición propia se conserva';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "FORMULA_proteger_clase_y_dueno"
  BEFORE UPDATE OF "tipoComposicion", "propietarioProductoId" ON "FORMULA"
  FOR EACH ROW EXECUTE FUNCTION proteger_clase_y_dueno_composicion();

-- Las órdenes anteriores quedan con snapshot nulo. No se reconstruye su receta histórica.
ALTER TABLE "PEDIDOS" ADD COLUMN "productoSnapshot" JSONB,
  ADD COLUMN "composicionCapturadaAt" TIMESTAMP(3);
ALTER TABLE "PEDIDOS" ADD CONSTRAINT "PEDIDOS_snapshot_completo_check"
  CHECK (("productoSnapshot" IS NULL AND "composicionCapturadaAt" IS NULL) OR
         ("productoSnapshot" IS NOT NULL AND "composicionCapturadaAt" IS NOT NULL AND
          jsonb_typeof("productoSnapshot") = 'object'));
CREATE FUNCTION proteger_composicion_orden() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD."productoSnapshot" IS NOT NULL AND
     (NEW."productoSnapshot" IS DISTINCT FROM OLD."productoSnapshot" OR
      NEW."composicionCapturadaAt" IS DISTINCT FROM OLD."composicionCapturadaAt") THEN
    RAISE EXCEPTION 'La composición registrada en la orden es inmutable';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER "PEDIDOS_proteger_composicion"
  BEFORE UPDATE OF "productoSnapshot", "composicionCapturadaAt" ON "PEDIDOS"
  FOR EACH ROW EXECUTE FUNCTION proteger_composicion_orden();
