import { cotizacionParaPrecios, precioEnArs } from './cotizacionBlue';
import { FormulasRepository } from "../repositories/formulas.repository";
import { prisma } from "../lib/prisma";

import { validarLineasComposicion } from './composicion';

export class FormulasService {
  repo = new FormulasRepository();

  async list(params: {
    estado?: string;
    search?: string;
    insumoId?: number;
  }) {
    return this.repo.findAll(params);
  }

  async detail(id: number) {
    return this.repo.findById(id);
  }

  async createFormula(dto: any) {
    if (typeof dto.nombre !== 'string' || !dto.nombre.trim()) throw new Error('El nombre es obligatorio');
    if (dto.tipoComposicion != null && dto.tipoComposicion !== 'reutilizable') throw new Error('Las composiciones propias se crean desde Productos');
    const nombre = dto.nombre.trim();
    const existente = await prisma.formula.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' }, activo: true, tipoComposicion: 'reutilizable' } });
    if (existente) throw new Error('El nombre de la fórmula ya existe');
    const lineas = validarLineasComposicion(dto.insumos);
    return this.repo.create({ nombre, esProtegida: !!dto.esProtegida, activo: true, tipoComposicion: 'reutilizable' }, lineas);
  }

  async updateFormula(id: number, dto: any) {
    const formula = await this.repo.findById(id);
    if (!formula) throw new Error('Fórmula reutilizable no encontrada');
    if (formula.esProtegida) throw new Error('No se puede modificar una fórmula protegida');
    if (typeof dto.nombre !== 'string' || !dto.nombre.trim()) throw new Error('El nombre es obligatorio');
    if (dto.tipoComposicion != null && dto.tipoComposicion !== 'reutilizable') throw new Error('No se puede cambiar el tipo de composición');
    const nombre = dto.nombre.trim();
    const existente = await prisma.formula.findFirst({ where: { nombre: { equals: nombre, mode: 'insensitive' }, activo: true, tipoComposicion: 'reutilizable', id: { not: id } } });
    if (existente) throw new Error('El nombre de la fórmula ya existe');
    const lineas = validarLineasComposicion(dto.insumos);
    return this.repo.update(id, { nombre, esProtegida: !!dto.esProtegida }, lineas);
  }

  async cloneFormula(id: number, dto: any) {
    const original = await this.repo.findById(id);
    if (!original) throw new Error('Fórmula reutilizable original no encontrada');
    return this.createFormula({
      ...dto,
      tipoComposicion: 'reutilizable',
      esProtegida: false,
      nombre: dto.nombre || original.nombre + ' (copia)',
      insumos: dto.insumos ?? original.formulaInsumos.map(fi => ({ idInsumo: fi.idInsumo, cantidadInsumo: fi.cantidadInsumo })),
    });
  }

  async softDeleteFormula(id: number) {
    const formula = await this.repo.findById(id);
    if (!formula) throw new Error('Fórmula reutilizable no encontrada');
    if (formula.esProtegida) throw new Error('No se puede eliminar una fórmula protegida');
    const productosAsociados = await prisma.producto.count({ where: { idFormula: id } });
    if (productosAsociados > 0) throw new Error('No se puede eliminar la fórmula porque tiene productos asociados.');
    return this.repo.softDelete(id);
  }

  async calcularCosto(idFormula: number) {
    const formula = await prisma.formula.findUnique({
      where: { id: idFormula },
      include: {
        formulaInsumos: {
          include: {
            insumo: {
              include: {
                precios: {
                  where: { activo: true },
                  take: 1,
                  include: { proveedor: true },
                },
              },
            },
          },
        },
      },
    });

    if (!formula || formula.tipoComposicion === "producto") throw new Error("Fórmula reutilizable no encontrada");

    const blue = await cotizacionParaPrecios(formula.formulaInsumos.map(fi => fi.insumo?.precios[0]));
    let costoPorPorcion = 0;
    const insumosSinPrecio: string[] = [];
    const detalle: { insumo: string; gramos: number; precioPorKg: number | null; costoAporte: number | null }[] = [];

    for (const fi of formula.formulaInsumos) {
      const insumo = fi.insumo;
      const precioActivo = insumo?.precios?.[0] ?? null;
      const gramos = fi.cantidadInsumo;

      const precioPorKg = precioEnArs(precioActivo, blue);
      if (precioPorKg === null) {
        insumosSinPrecio.push(insumo?.nombre ?? `#${fi.idInsumo}`);
        detalle.push({ insumo: insumo?.nombre ?? `#${fi.idInsumo}`, gramos, precioPorKg: null, costoAporte: null });
      } else {
        const aporte = (gramos / 1000) * precioPorKg;
        costoPorPorcion += aporte;
        detalle.push({ insumo: insumo!.nombre, gramos, precioPorKg, costoAporte: aporte });
      }
    }

    const esParcial = insumosSinPrecio.length > 0 || detalle.length === 0;

    return {
      cotizacionBlue: blue,
      costoPorPorcion: esParcial ? null : costoPorPorcion,
      esParcial,
      insumosSinPrecio,
      detalle,
    };
  }
}
