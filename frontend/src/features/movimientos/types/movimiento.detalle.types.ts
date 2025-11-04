import type { EstadoMovimiento, TipoMovimiento } from './movimiento.types';

export type MovimientoHistorialEvent = {
  id: number;
  estado: EstadoMovimiento;
  fechaInicio: string | null; // dd/mm/yy
  fechaFin: string | null;    // dd/mm/yy or null if actual
  responsable?: string;
  observaciones?: string;
};

export type MovimientoDetalle = {
  id: number;
  tipo: TipoMovimiento;
  productoNombre: string;
  estado: EstadoMovimiento;
  cantidad: number;
  depositoOrigenNombre: string | null;
  depositoDestinoNombre: string | null;
  fechaCreacion: string; // dd/mm/yy
  responsable?: string;
  observaciones?: string;
  referencia?: string;
  historial: MovimientoHistorialEvent[];
};
