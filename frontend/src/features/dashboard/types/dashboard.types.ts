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
