// Los 3 depósitos de la fábrica, por rol operativo.
// Si en el panel los nombraste distinto, cambiá SOLO estos strings.
export const DEPOSITO_ROLES = {
  atras: "Fábrica-Atrás",     // entra lo recién elaborado
  intermedio: "Intermedio",    // paso intermedio hacia ventas
  estanteria: "Estantería",    // de acá sale el stock a la venta (egreso)
} as const;

export type DepositoRol = keyof typeof DEPOSITO_ROLES;

function norm(s: string): string {
  // Quita diacríticos (rango combining marks U+0300–U+036F)
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

// Resuelve un depósito por rol, tolerante a acentos/mayúsculas.
// Primero match exacto; si no, por inclusión (ej: "Estantería Ventas").
export function findDepositoByRole<T extends { nombre: string }>(
  depositos: T[],
  rol: DepositoRol
): T | undefined {
  const target = norm(DEPOSITO_ROLES[rol]);
  return (
    depositos.find((d) => norm(d.nombre) === target) ??
    depositos.find((d) => norm(d.nombre).includes(target))
  );
}
