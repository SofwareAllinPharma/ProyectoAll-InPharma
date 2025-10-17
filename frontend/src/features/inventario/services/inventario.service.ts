import axios from 'axios';

export interface InventarioGlobalResumen {
  totalProductos: number;
  normal: number;
  bajo: number;
  critico: number;
  default: number;
}

export interface InventarioProducto {
  idProducto: number;
  nombreComercial: string;
  cantidadProducto: number | null;
  umbralMin: number | null;
  estado: 'CRITICO' | 'BAJO' | 'NORMAL' | 'DEFAULT';
  updatedAt: string | null;
}

export interface DistribucionDeposito {
  idDeposito: number;
  nombre: string;
  cantidad: number;
  porcentaje: number;
  estado?: 'CRITICO' | 'BAJO' | 'NORMAL' | 'DEFAULT';
  umbralMin?: number;
}

export interface StockGlobalRow {
  idProducto: number;
  producto: string;
  stockTotal: number;
  distribucion: DistribucionDeposito[];
  updatedAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export class InventarioService {
  static async getInventarioByDeposito(idDeposito: number): Promise<InventarioProducto[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventario/${idDeposito}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return (response.data as any[]).map((item) => {
        const cantidad = item.cantidadProducto === undefined ? null : item.cantidadProducto;
        const umbral = item.umbralMin === undefined ? null : item.umbralMin;
        let estado: 'CRITICO' | 'BAJO' | 'NORMAL' | 'DEFAULT' = 'DEFAULT';
        if (typeof umbral === 'number') {
          if (typeof cantidad === 'number' && cantidad < umbral) estado = 'CRITICO';
          else if (typeof cantidad === 'number' && cantidad <= umbral + 5) estado = 'BAJO';
          else if (typeof cantidad === 'number') estado = 'NORMAL';
        }
        return {
          idProducto: item.idProducto,
          nombreComercial: item.nombreComercial,
          cantidadProducto: cantidad,
          umbralMin: umbral,
          estado,
          updatedAt: item.updatedAt ?? null,
        };
      });
    } catch (error) {
      console.error('Error en getInventarioByDeposito:', error);
      throw error;
    }
  }

  static async getProductosConUmbral(idDeposito: number): Promise<InventarioProducto[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventario/${idDeposito}/umbrales-config`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      return (response.data as any[]).map((item) => {
        const cantidad = item.cantidadProducto ?? null;
        const umbral = item.umbralMin ?? null;
        const estadoFE = String(item.estado ?? 'default').toUpperCase() as InventarioProducto['estado'];
        return {
          idProducto: item.idProducto,
          nombreComercial: item.nombreComercial,
          cantidadProducto: cantidad,
          umbralMin: umbral,
          estado: estadoFE,
          updatedAt: null,
        };
      });
    } catch (error) {
      console.error('Error en getProductosConUmbral:', error);
      throw error;
    }
  }

  static async updateUmbralMin(idDeposito: number, idProducto: number, umbralMin: number): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/inventario/${idDeposito}/${idProducto}/umbral-min`,
        { umbralMin },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error en updateUmbralMin:', error);
      throw error;
    }
  }

  static async bulkUpdateUmbrales(idDeposito: number, items: { idProducto: number; umbralMin: number }[]): Promise<any> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}/inventario/${idDeposito}/umbrales`,
        { items },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error en bulkUpdateUmbrales:', error);
      throw error;
    }
  }

  static async getResumenEstados(idDeposito: number): Promise<{
    total: number; normal: number; bajo: number; critico: number; default: number;
  }> {
    const token = localStorage.getItem('token');
    const resp = await axios.get(`${API_BASE_URL}/inventario/${idDeposito}/resumen-estados`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });
    const d = resp.data || {};
    return {
      total: Number(d.total ?? 0),
      normal: Number(d.normal ?? 0),
      bajo: Number(d.bajo ?? 0),
      critico: Number(d.critico ?? 0),
      default: Number(d.default ?? 0),
    };
  }
}

export class InventarioGlobalService {
  static async getStockGlobal(): Promise<StockGlobalRow[]> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventario-global`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data as StockGlobalRow[];
    } catch (error) {
      console.error('Error en getStockGlobal:', error);
      throw error;
    }
  }

  static async getResumenEstadosGlobal(): Promise<InventarioGlobalResumen> {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/inventario-global/resumen-estados`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      return response.data as InventarioGlobalResumen;
    } catch (error) {
      console.error('Error en getResumenEstadosGlobal:', error);
      throw error;
    }
  }
}
