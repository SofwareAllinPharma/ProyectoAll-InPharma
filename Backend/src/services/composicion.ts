import type { Prisma } from '@prisma/client';

export type LineaComposicion = { idInsumo: number; cantidadInsumo: number };

export function validarLineasComposicion(raw: unknown): LineaComposicion[] {
  if (!Array.isArray(raw) || raw.length === 0) throw new Error('Debes agregar al menos un insumo a la composición');
  const ids = new Set<number>();
  return raw.map((linea: unknown) => {
    if (!linea || typeof linea !== 'object') throw new Error('Línea de composición inválida');
    const { idInsumo, cantidadInsumo } = linea as Partial<LineaComposicion>;
    if (!Number.isSafeInteger(idInsumo) || idInsumo! <= 0) throw new Error('Insumo inválido');
    if (typeof cantidadInsumo !== 'number' || !Number.isFinite(cantidadInsumo) || cantidadInsumo <= 0) {
      throw new Error('Cada cantidad de insumo debe ser un número finito mayor a 0');
    }
    if (ids.has(idInsumo!)) throw new Error('No se puede agregar el mismo insumo más de una vez');
    ids.add(idInsumo!);
    return { idInsumo: idInsumo!, cantidadInsumo };
  });
}

export async function calcularComposicion(db: Pick<Prisma.TransactionClient, 'insumo'>, raw: unknown) {
  const lineas = validarLineasComposicion(raw);
  const insumos = await db.insumo.findMany({ where: { id: { in: lineas.map(i => i.idInsumo) }, activo: true } });
  const valores = { grasaTotal: 0, grasaTrans: 0, grasaSaturada: 0, proteinas: 0, carbohidratos: 0, sodio: 0, fibra: 0, otros: 0, kcalorias: 0 };
  const campos = { grasaTotal: 'grasasTotales_100g', grasaTrans: 'grasasTrans_100g', grasaSaturada: 'grasasSaturadas_100g', proteinas: 'proteinas_100g', carbohidratos: 'carbohidratos_100g', sodio: 'sodio_100g', fibra: 'fibra_100g', otros: 'otro_100g', kcalorias: 'cal_100g' } as const;
  let porcion = 0;
  for (const linea of lineas) {
    const insumo = insumos.find(i => i.id === linea.idInsumo);
    if (!insumo) throw new Error(`Insumo ${linea.idInsumo} inexistente o inactivo`);
    porcion += linea.cantidadInsumo;
    for (const clave of Object.keys(campos) as (keyof typeof campos)[]) {
      const valor = insumo[campos[clave]];
      if (!Number.isFinite(valor) || valor < 0) throw new Error(`La ficha nutricional del insumo ${insumo.id} contiene datos inválidos`);
      valores[clave] += valor * linea.cantidadInsumo / 100;
    }
  }
  if (!Number.isFinite(porcion) || porcion <= 0) throw new Error('La porción calculada debe ser finita y mayor a 0');
  for (const clave of Object.keys(valores) as (keyof typeof valores)[]) {
    if (!Number.isFinite(valores[clave])) throw new Error('El cálculo nutricional excede el rango permitido');
    valores[clave] = Math.round(valores[clave] * 10000) / 10000;
    if (!Number.isFinite(valores[clave])) throw new Error('El cálculo nutricional excede el rango permitido');
  }
  const kjuls = Math.round(valores.kcalorias * 4.184 * 10000) / 10000;
  if (!Number.isFinite(kjuls)) throw new Error('El cálculo de energía excede el rango permitido');
  return { porcion, ...valores, kjuls, lineas };
}

// Serializa cambios de catálogo y captura de órdenes para evitar nutrición mezclada.
export async function bloquearCatalogoComposicion(tx: Prisma.TransactionClient) {
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(464703, 0)`;
}
