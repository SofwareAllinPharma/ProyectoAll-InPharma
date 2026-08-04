import { Request, Response, NextFunction } from "express";

// Middleware para integraciones externas (n8n): valida el header x-api-key
// contra INTEGRATION_API_KEY. Aislado del login JWT de usuarios.
export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.INTEGRATION_API_KEY;
  if (!expected) {
    return res
      .status(503)
      .json({ error: "Integración no configurada (falta INTEGRATION_API_KEY)" });
  }
  const provided = req.header("x-api-key");
  if (!provided || provided !== expected) {
    return res.status(401).json({ error: "API key inválida" });
  }
  next();
}
