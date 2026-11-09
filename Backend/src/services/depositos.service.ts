import { PrismaClient, Deposito } from "@prisma/client";
import { prisma } from "../lib/prisma";

export type CrearDepositoDTO = {
  nombre: string;
  direccion: string;
  responsable: string;
  capacidadTotal: number;
  estado?: boolean; // default true si no viene
};

export class DepositosService {
  //Crear un nuevo depósito
  async create(data: CrearDepositoDTO): Promise<Deposito> {
    const { nombre, direccion, responsable, capacidadTotal, estado } = data;
    const nombreTrim = nombre.trim();

    // "nombre" es @unique y la baja es lógica (estado:false): un depósito desactivado
    // sigue ocupando el nombre y bloquearía un create nuevo. Si existe uno inactivo con
    // ese nombre, lo reactivamos con los datos nuevos en vez de fallar con 409.
    const existente = await prisma.deposito.findUnique({ where: { nombre: nombreTrim } });
    if (existente) {
      if (existente.estado) {
        throw new Error("Ya existe un depósito con ese nombre.");
      }
      return prisma.deposito.update({
        where: { id: existente.id },
        data: { direccion, responsable, capacidadTotal, estado: true },
      });
    }

    return prisma.deposito.create({
      data: {
        nombre: nombreTrim,
        direccion,
        responsable,
        capacidadTotal,
        ...(typeof estado === "boolean" ? { estado } : {}), // si no viene, DB aplica default true
      },
    });
  }

  //Consultar todos los depósitos
  async findAll(): Promise<Deposito[]> {
    // solo activos
    return prisma.deposito.findMany({
      where: { estado: true },
      orderBy: { id: "asc" },
    });
  }
  //Consultar por ID
  async findById(id: number): Promise<Deposito | null> {
    return prisma.deposito.findUnique({
      where: { id },
    });
  }

  // ✅ Modificar solo responsable y capacidadTotal
  async update(
    id: number,
    data: { nombre?: string; responsable?: string; capacidadTotal?: number }
  ): Promise<Deposito> {
    if (
      data.capacidadTotal !== undefined &&
      (Number.isNaN(data.capacidadTotal) || data.capacidadTotal < 0)
    ) {
      throw new Error("capacidadTotal debe ser un número >= 0.");
    }
    if (data.nombre !== undefined && data.nombre.trim().length < 3) {
      throw new Error("El nombre debe tener al menos 3 caracteres.");
    }

    return prisma.deposito.update({
      where: { id },
      data: {
        ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
        ...(data.responsable !== undefined
          ? { responsable: data.responsable }
          : {}),
        ...(data.capacidadTotal !== undefined
          ? { capacidadTotal: data.capacidadTotal }
          : {}),
      },
    });
  }
  /**
   * Baja lógica (desactivar) cumpliendo reglas:
   * - Stock total del depósito = 0
   * - Sin movimientos pendientes
   * aún no tiene tablas de stock/movimientos,
   * métodos del service (getStockTotalEnDeposito y tieneMovimientosPendientes
   */
  async deactivate(id: number): Promise<Deposito> {
    const dep = await prisma.deposito.findUnique({ where: { id } });
    if (!dep) throw new Error("Depósito no encontrado");
    if (dep.esProtegido || dep.nombre === "Fábrica") {
      throw new Error("Este depósito es del sistema y no puede eliminarse ni desactivarse.");
    }
    return prisma.deposito.update({
      where: { id },
      data: { estado: false },
    });
  }
}
