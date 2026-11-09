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
  const n = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toUpperCase();
  if (n.includes("SISTEMA") || n.includes("SIS")) return ROLE_CODES.ADMINSIS;
  if (n.includes("FABRICA") || n.includes("FAB")) return ROLE_CODES.ADMINFAB;
  if (n.includes("TECNICO") || n.includes("TECN")) return ROLE_CODES.TECNICO;
  if (n.includes("VENTA") || n.includes("PUNTO") || n.includes("ENC")) return ROLE_CODES.ENCPTOVENTA;
  return null;
}

export interface ProfileAssignment {
  idPerfil: number;
  nombre: string;
  role: RoleCode | null;
}

// Elegir un rol de pantalla no crea una asignación: solo se devuelven perfiles reales del usuario.
export function selectAssignedProfile(
  perfiles: ProfileAssignment[],
  preferredRole?: string | null,
  allowedRoles: readonly RoleCode[] = Object.values(ROLE_CODES)
): ProfileAssignment | undefined {
  const disponibles = perfiles.filter(p => Number.isSafeInteger(p.idPerfil) && p.idPerfil > 0 && p.role != null && allowedRoles.includes(p.role));
  return disponibles.find(p => p.role === preferredRole) ?? disponibles.slice().sort((a, b) => a.idPerfil - b.idPerfil)[0];
}
