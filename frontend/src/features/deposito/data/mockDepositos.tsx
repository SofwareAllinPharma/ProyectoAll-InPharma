import type { Deposito } from '../types/deposito.types';

export const mockDepositos: Deposito[] = [
  { id: 1, nombre: 'Depósito Central', ubicacion: 'Calle Principal 123, Ciudad', capacidadTotal: 5000, capacidadUsada: 3500, responsable: 'Juan Pérez', estado: true },
  { id: 2, nombre: 'Sucursal Norte', ubicacion: 'Av. Norte 456, Ciudad Norte', capacidadTotal: 2000, capacidadUsada: 1200, responsable: 'María González', estado: true },
  { id: 3, nombre: 'Sucursal Sur', ubicacion: 'Av. Sur 789, Ciudad Sur', capacidadTotal: 1500, capacidadUsada: 900, responsable: 'Carlos Rodríguez', estado: true },
];
