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
}

export type UpdateInsumoDto = Partial<CreateInsumoDto>;

export interface InsumoModalAction {
  type: 'edit' | 'delete' | 'cancel';
  insumo?: Insumo;
}