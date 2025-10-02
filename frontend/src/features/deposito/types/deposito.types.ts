export type DepositoEstado = boolean; 

export interface Deposito {
  id: number;             
  nombre: string;
  ubicacion: string;
  capacidadTotal: number;
  capacidadUsada: number;  
  responsable: string;
  estado: DepositoEstado;   
}

export interface CreateDepositoDTO {
  nombre: string;
  ubicacion: string;
  capacidadTotal: number;
  responsable: string;
}

export interface UpdateDepositoDTO {
  capacidadTotal: number;
  responsable: string;
}

export interface CanDeleteResponse {
  canDelete: boolean;
  reason?: 'STOCK_NOT_ZERO' | 'PENDING_MOVEMENTS' | 'UNKNOWN';
  stockActual?: number;
}