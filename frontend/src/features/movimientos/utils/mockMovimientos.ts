import type { Movimiento } from '../types/movimiento.types';

export function generateMockMovimientos(idDeposito?: number): Movimiento[] {
  const productos = [
    { id: 1, nombre: 'Proteína Whey Frutilla' },
    { id: 2, nombre: 'Glutamina Pura' },
    { id: 3, nombre: 'Creatina Monohidratada' },
    { id: 4, nombre: 'Proteína Whey Chocolate' }
  ];

  const depositos = [
    { id: 1, nombre: 'Depósito Central' },
    { id: 2, nombre: 'Sucursal Norte' },
    { id: 3, nombre: 'Sucursal Sur' }
  ];

  const usuarios = [
    { id: 1, nombre: 'Ana Gómez' },
    { id: 2, nombre: 'Carlos Méndez' },
    { id: 3, nombre: 'María Fernández' }
  ];

  const generarFecha = (diasAtras: number) => {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - diasAtras);
    return fecha.toISOString();
  };

  const mockData: Movimiento[] = [
    {
      id: 1,
      tipo: 'TRASLADO',
      idProducto: 3,
      cantidad: 15,
      idDepositoOrigen: 1,
      idDepositoDestino: 3,
      referencia: 'Traslado programado',
      observaciones: null,
      estado: 'ENTREGADO',
      fechaCreacion: generarFecha(11),
      fechaActualizacion: generarFecha(10),
      idUsuario: 2,
      producto: { idProducto: 3, nombreComercial: productos[2].nombre },
      depositoOrigen: { id: 1, nombre: depositos[0].nombre },
      depositoDestino: { id: 3, nombre: depositos[2].nombre },
      usuario: { id: 2, nombre: usuarios[1].nombre }
    },
    {
      id: 2,
      tipo: 'EGRESO',
      idProducto: 4,
      cantidad: 30,
      idDepositoOrigen: 2,
      idDepositoDestino: null,
      referencia: 'Envío a cliente - Pedido #ORD-2345',
      observaciones: 'Cliente: Gimnasio PowerFit',
      estado: 'ENTREGADO',
      fechaCreacion: generarFecha(10),
      fechaActualizacion: generarFecha(9),
      idUsuario: 3,
      producto: { idProducto: 4, nombreComercial: productos[3].nombre },
      depositoOrigen: { id: 2, nombre: depositos[1].nombre },
      depositoDestino: null,
      usuario: { id: 3, nombre: usuarios[2].nombre }
    },
    {
      id: 3,
      tipo: 'TRASLADO',
      idProducto: 1,
      cantidad: 25,
      idDepositoOrigen: 1,
      idDepositoDestino: 2,
      referencia: 'Traslado programado',
      observaciones: null,
      estado: 'EN_CAMINO',
      fechaCreacion: generarFecha(2),
      fechaActualizacion: generarFecha(2),
      idUsuario: 1,
      producto: { idProducto: 1, nombreComercial: productos[0].nombre },
      depositoOrigen: { id: 1, nombre: depositos[0].nombre },
      depositoDestino: { id: 2, nombre: depositos[1].nombre },
      usuario: { id: 1, nombre: usuarios[0].nombre }
    },
    {
      id: 4,
      tipo: 'EGRESO',
      idProducto: 2,
      cantidad: 20,
      idDepositoOrigen: 3,
      idDepositoDestino: null,
      referencia: 'Envío a cliente - Pedido #ORD-3345',
      observaciones: 'Entrega programada',
      estado: 'EN_CAMINO',
      fechaCreacion: generarFecha(1),
      fechaActualizacion: generarFecha(1),
      idUsuario: 2,
      producto: { idProducto: 2, nombreComercial: productos[1].nombre },
      depositoOrigen: { id: 3, nombre: depositos[2].nombre },
      depositoDestino: null,
      usuario: { id: 2, nombre: usuarios[1].nombre }
    },
    {
      id: 5,
      tipo: 'EGRESO',
      idProducto: 1,
      cantidad: 10,
      idDepositoOrigen: 1,
      idDepositoDestino: null,
      referencia: 'Envío a cliente - Pedido #ORD-2289',
      observaciones: 'Cancelado por cliente',
      estado: 'CANCELADO',
      fechaCreacion: generarFecha(5),
      fechaActualizacion: generarFecha(4),
      idUsuario: 1,
      producto: { idProducto: 1, nombreComercial: productos[0].nombre },
      depositoOrigen: { id: 1, nombre: depositos[0].nombre },
      depositoDestino: null,
      usuario: { id: 1, nombre: usuarios[0].nombre }
    }
  ];

  if (idDeposito) {
    return mockData.filter(m => 
      m.idDepositoOrigen === idDeposito || m.idDepositoDestino === idDeposito
    );
  }

  return mockData;
}