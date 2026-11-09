export interface TopProduct {
  idProducto?: number;
  label: string;
  value: number;
  color?: string;
}

export interface OrderStatusData {
  label: string;
  value: number;
  color: string;
  estadoId: number;
}

export interface InventoryAlerts {
  total: number;
  critico: number;
  bajo: number;
}

export interface WeeklyProductionData {
  date: string;
  grams: number;
}

export interface ChartData extends WeeklyProductionData {
  displayDate: string;
  fullDate: string;
  originalDateObj: Date;
}

export interface CriticalStockAlert {
  idProducto: number;
  nombreProducto: string;
  deposito: string;
  stock: number;
  umbral: number;
  estado: 'CRITICO' | 'BAJO';
}

export interface PendingMovementAlert {
  idMovimiento: number;
  referencia: string;
  origen: string;
  destino: string;
  estado: string;
  fecha: string;
  diasPendiente: number;
  tiempoTranscurrido: string;
  nombreProducto: string;
  responsable: string;
}

export interface CompanyAlertsData {
  movimientos: PendingMovementAlert[];
}
