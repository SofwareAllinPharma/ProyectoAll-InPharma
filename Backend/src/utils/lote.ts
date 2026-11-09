import assert from "node:assert";

// Slug corto del producto para el número de lote: sin acentos, alfanumérico, 6 chars.
export function slugProducto(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  return base.slice(0, 6) || "PROD";
}

// Número de lote: YYYYMMDD-SLUG-NN (secuencia diaria por producto, base 1).
export function generarNumeroLote(fecha: Date, slug: string, secuencia: number): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  const nn = String(secuencia).padStart(2, "0");
  return `${y}${m}${d}-${slug}-${nn}`;
}

// Vencimiento = fecha de elaboración + días (no muta el original).
export function calcularVencimiento(fechaElaboracion: Date, diasVencimiento: number): Date {
  const vto = new Date(fechaElaboracion);
  vto.setDate(vto.getDate() + diasVencimiento);
  return vto;
}

// Agrega unidades por lote desde una lista de cajas (las cajas son la fuente de verdad del stock).
export function stockPorLote(cajas: { idLote: number; unidades: number }[]): Map<number, number> {
  const m = new Map<number, number>();
  for (const c of cajas) m.set(c.idLote, (m.get(c.idLote) ?? 0) + c.unidades);
  return m;
}

// self-check: npx tsx src/utils/lote.ts
if (require.main === module) {
  assert.equal(slugProducto("Colágeno"), "COLAGE");
  assert.equal(slugProducto("Vitamina C"), "VITAMI");
  assert.equal(slugProducto(""), "PROD");

  assert.equal(generarNumeroLote(new Date(2026, 7, 3), "COLAG", 1), "20260803-COLAG-01");
  assert.equal(generarNumeroLote(new Date(2026, 11, 25), "PROT", 12), "20261225-PROT-12");

  const vto = calcularVencimiento(new Date(2026, 7, 3), 60); // 3-ago + 60d = 2-oct
  assert.equal(vto.getMonth(), 9);
  assert.equal(vto.getDate(), 2);

  const s = stockPorLote([
    { idLote: 1, unidades: 15 },
    { idLote: 1, unidades: 12 },
    { idLote: 2, unidades: 15 },
  ]);
  assert.equal(s.get(1), 27); // caja parcial: 15 + 12
  assert.equal(s.get(2), 15);

  console.log("lote.ts self-check OK");
}
