import { api } from '../../../lib/api';

export type StockLote = {
  idLote: number;
  numeroLote: string;
  fechaVencimiento: string;
  unidades: number;
  cajas: number;
};

export type StockProducto = {
  idProducto: number;
  nombreComercial: string;
  totalUnidades: number;
  totalCajas: number;
  lotes: StockLote[];
};

export const LoteStockService = {
  // Stock de un depósito derivado de las cajas (total por producto + lotes, FIFO).
  async stockPorDeposito(idDeposito: number): Promise<StockProducto[]> {
    const { data } = await api.get(`/lotes/stock/deposito/${idDeposito}`);
    return data;
  },

  // Traslado de N cajas enteras de un producto entre depósitos (doble firma).
  async trasladar(payload: {
    idDepositoOrigen: number;
    idDepositoDestino: number;
    idProducto: number;
    cantidadCajas: number;
    responsableEnvio: string;
    responsableRecepcion: string;
  }): Promise<{ movidas: number; unidades: number }> {
    const { data } = await api.post('/lotes/traslado', payload);
    return data;
  },
};
