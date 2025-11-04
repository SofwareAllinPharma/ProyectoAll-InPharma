import type { EstadoMovimiento, TipoMovimiento } from './movimiento.types';

export type MovimientoHistorialEvent = {
  id: number;
  estado: EstadoMovimiento;
  fechaInicio: string | null; // dd/mm/yy HH:mm
  fechaFin: string | null;    // dd/mm/yy HH:mm or null if actual
  responsable?: string;
  // Sólo para estado ENTREGADO
  responsableEntrega?: string;
  responsableRecepcion?: string;
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
