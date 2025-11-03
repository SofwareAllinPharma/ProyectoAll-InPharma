// Tipos de movimiento según documento
export type TipoMovimiento = 'EGRESO' | 'TRASLADO' | 'INGRESO';

// Estados según documento
export type EstadoMovimiento = 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO';

// Interface principal del movimiento
export interface Movimiento {
  id: number;
  tipo: TipoMovimiento;
  idProducto: number;
  cantidad: number;
  idDepositoOrigen: number;
  idDepositoDestino?: number | null;
  referencia: string;
  observaciones?: string | null;
  estado: EstadoMovimiento;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
  idUsuario: number;
  
  // Relaciones
  producto?: {
    idProducto: number;
    nombreComercial: string;
  };
  depositoOrigen: {
    id: number;
    nombre: string;
  };
  depositoDestino?: {
    id: number;
    nombre: string;
  } | null;
  usuario?: {
    id: number;
    nombre: string;
  };
}

// DTO para crear movimiento
export interface CreateMovimientoRequest {
  tipo: TipoMovimiento;
  idProducto: number;
  cantidad: number;
  idDepositoOrigen: number;
  idDepositoDestino?: number;
  referencia: string;
  observaciones?: string;
}

// DTO para actualizar estado
export interface UpdateEstadoMovimientoRequest {
  estado: EstadoMovimiento;
  observaciones?: string;
}

// Filtros de búsqueda
export interface MovimientoFilters {
  tipo?: TipoMovimiento | '';
  estado?: EstadoMovimiento | '';
  idDeposito?: number | '';
  fechaDesde?: string;
  fechaHasta?: string;
  search?: string;
}

// Resumen para cards
export interface MovimientosResumen {
  total: number;
  egresos: number;
  traslados: number;
}