export interface Insumo {
  id: number;
  nombre: string;
  cal_100g: number;
  grasasTotales_100g: number;
  grasasTrans_100g: number;
  grasasSaturadas_100g: number;
  proteinas_100g: number;
  carbohidratos_100g: number;
  sodio_100g: number;
  fibra_100g: number;
  otro_100g: number;
  otroAlias?: string;
}

export interface CreateInsumoDto {
  nombre: string;
  cal_100g: number;
  grasasTotales_100g: number;
  grasasTrans_100g: number;
  grasasSaturadas_100g: number;
  proteinas_100g: number;
  carbohidratos_100g: number;
  sodio_100g: number;
  fibra_100g: number;
  otro_100g: number;
  otroAlias?: string;
}

export type UpdateInsumoDto = Partial<CreateInsumoDto>;

export interface InsumoModalAction {
  type: 'edit' | 'delete' | 'cancel';
  insumo?: Insumo;
}

export interface PrecioInsumo {
  id: number;
  idInsumo: number;
  idProveedor: number;
  precioPorKg: number;
  activo: boolean;
  fechaDesde: string;
  fechaHasta: string | null;
  observacion: string | null;
  proveedor: { id: number; nombre: string };
}