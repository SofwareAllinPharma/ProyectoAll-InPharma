export interface Proveedor {
  id: number;
  nombre: string;
  telefono?: string | null;
  email?: string | null;
  cuit?: string | null;
  razonSocial?: string | null;
  activo: boolean;
}

export interface CreateProveedorDto {
  nombre: string;
  telefono?: string;
  email?: string;
  cuit?: string;
  razonSocial?: string;
}

export type UpdateProveedorDto = Partial<CreateProveedorDto>;

export interface ProveedorDetalle extends Proveedor {
  precios: {
    id: number;
    idInsumo: number;
    precioPorKg: number;
    activo: boolean;
    fechaDesde: string;
    fechaHasta: string | null;
    observacion: string | null;
    insumo: { id: number; nombre: string; activo: boolean };
  }[];
}
