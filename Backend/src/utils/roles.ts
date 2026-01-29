export const ROLE_CODES = {
  TECNICO: "TECNICO",
  ADMINFAB: "ADMINFAB",
  ADMINSIS: "ADMINSIS",
  ENCPTOVENTA: "ENCPTOVENTA",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

// Normaliza nombres de perfil (como vienen en la BD) a códigos usados en la app.
export function normalizeRoleName(name: string): RoleCode | null {
  if (!name) return null;
  const n = name.trim().toUpperCase();

  // Check for ADMINSIS first (most specific)
  if (n.includes("SISTEMA") || n.includes("SIS")) return ROLE_CODES.ADMINSIS;

  // Check for ADMINFAB
  if (n.includes("FABRICA") || n.includes("FAB")) return ROLE_CODES.ADMINFAB;

  // Check for TECNICO
  if (n.includes("TECNICO") || n.includes("TECN")) return ROLE_CODES.TECNICO;

  // Check for ENCPTOVENTA
  if (n.includes("VENTA") || n.includes("PUNTO") || n.includes("ENC")) return ROLE_CODES.ENCPTOVENTA;

  return null;
}
