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

    return prisma.deposito.create({
      data: {
        nombre,
        direccion,
        responsable,
        capacidadTotal,
        ...(typeof estado === "boolean" ? { estado } : {}), // si no viene, DB aplica default true
      },
    });    
  }
  
  //Consultar todos los depósitos
  async findAll(): Promise<Deposito[]> {
    return prisma.deposito.findMany({
      orderBy: { id: "asc" },
    });
  }
  // ✅ Consultar por ID
  async findById(id: number): Promise<Deposito | null> {
    return prisma.deposito.findUnique({
      where: { id },
    });
  }
  
 
}
