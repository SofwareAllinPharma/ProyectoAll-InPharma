export const ROLE_CODES = {
  TECNICO: "TECNICO",
  ADMINFAB: "ADMINFAB",
  ADMINSIS: "ADMINSIS",
} as const;

export type RoleCode = (typeof ROLE_CODES)[keyof typeof ROLE_CODES];

// Normaliza nombres de perfil (como vienen en la BD) a códigos usados en la app.
export function normalizeRoleName(name: string): RoleCode | null {
  if (!name) return null;
  const n = name.trim().toUpperCase();
  if (n.includes("TECN")) return ROLE_CODES.TECNICO;
  if (n.includes("FABRICA") || n.includes("FAB")) return ROLE_CODES.ADMINFAB;
  if (n.includes("SISTEMA") || n.includes("ADMIN")) return ROLE_CODES.ADMINSIS;
  return null;
}
