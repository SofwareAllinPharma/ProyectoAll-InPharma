export interface Deposito {
  id: number;
  nombre: string;
  direccion: string;      
  responsable: string;
  capacidadTotal: number;
  capacidadUsada: number;
  estado: boolean;
  esProtegido?: boolean;
}

export interface CreateDepositoDTO {
  nombre: string;
  direccion: string;       
  responsable: string;
  capacidadTotal: number;  
}

export interface UpdateDepositoDTO {
  nombre?: string;
  responsable?: string;
  capacidadTotal?: number;
}
