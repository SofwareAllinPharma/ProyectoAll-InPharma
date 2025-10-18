export interface DistribucionDeposito {
  idDeposito: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
  estado?: 'CRITICO' | 'BAJO' | 'NORMAL' | 'DEFAULT';
  umbralMin?: number;
}

export interface StockGlobalRow {
  idProducto: number;
  producto: string;
  stockTotal: number;
  distribucion: DistribucionDeposito[];
  updatedAt?: string;
}
