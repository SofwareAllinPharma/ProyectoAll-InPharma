import { Request, Response, NextFunction } from "express";

export function validateInsumo(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    nombre,
    cal_100g,
    grasasTotales_100g,
    grasasTrans_100g,
    grasasSaturadas_100g,
    proteinas_100g,
    carbohidratos_100g,
    sodio_100g,
    fibra_100g,
    otro_100g,
  } = req.body;

  if (typeof nombre !== "string" || !nombre.trim()) {
    return res
      .status(400)
      .json({ error: "El nombre es obligatorio y debe ser un string." });
  }
  const numericFields = [
    cal_100g,
    grasasTotales_100g,
    grasasTrans_100g,
    grasasSaturadas_100g,
    proteinas_100g,
    carbohidratos_100g,
    sodio_100g,
    fibra_100g,
    otro_100g,
  ];
  for (const field of numericFields) {
    if (typeof field !== "number" || isNaN(field)) {
      return res
        .status(400)
        .json({
          error:
            "Todos los campos numéricos son obligatorios y deben ser números.",
        });
    }
  }
  next();
}
