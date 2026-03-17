export type EstadoPedido = {
  id: number;
  nombre: string;
};

export type CambioEstado = {
  idCambioEstado: number;
  idPedido: number;
  idEstadoPedido: number;
  fechaHoraInicio: string | Date;
  fechaHoraFin?: string | Date | null;
  responsable?: string | null;
  estado?: EstadoPedido;
};

export type ProductoMin = {
  idProducto: number;
  nombreComercial: string;
  pesoNeto: number;
  formula?: {
    porcion: number;
  } | null;
};

export type Pedido = {
  numPedido: number;
  idProducto: number;
  producto?: ProductoMin | null;
  cantAProducir_gramos: number;
  cantAProducir_paquetes: number;
  cantAProducir_porciones: number;
  cantElaborada_paquetes?: number | null;
  cantElaborada_gramos?: number | null;
  cantElaborada_porciones?: number | null;
  observacion?: string | null;
  idCambioEstadoPedido?: number | null;
  mailUsuarioCreador: string;
  idPerfilCreador: number;
  mailUsuarioCocinero?: string | null;
  idPerfilCocinero?: number | null;
  estaAsignado: boolean;
  createdAt: string;
  updatedAt: string;
  cambioActual?: CambioEstado | null;
  cambios?: CambioEstado[];
  // Relaciones opcionales incluidas cuando el backend las retorna mediante include
  creador?: {
    usuario?: { persona?: { nombre?: string | null; apellido?: string | null } | null } | null;
    perfil?: { id?: number; nombre?: string } | null;
  } | null;
  cocinero?: {
    usuario?: { persona?: { nombre?: string | null; apellido?: string | null } | null } | null;
    perfil?: { id?: number; nombre?: string } | null;
  } | null;
};

export type CreatePedidoRequest = {
  idProducto: number;
  gramos?: number;
  paquetes?: number;
  porciones?: number;
  observacion?: string;
  mailUsuarioCreador: string;
  idPerfilCreador: number;
};

export type TomarPedidoRequest = {
  mailUsuarioCocinero: string;
  idPerfilCocinero: number;
};
