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
