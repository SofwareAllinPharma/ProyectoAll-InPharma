import { api } from '../../../lib/api';

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
  horaActualizacion?: string | null;
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

export class InventarioService {
  static async getInventarioByDeposito(idDeposito: number): Promise<InventarioProducto[]> {
    try {
      const { data } = await api.get(`/inventario/${idDeposito}`);
      const toHour = (s?: string | null): string | null => {
        if (!s) return null;
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      };

      return (data as any[]).map((item) => {
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
          horaActualizacion: toHour(item.updatedAt ?? null),
        };
      });
    } catch (error) {
      console.error('Error en getInventarioByDeposito:', error);
      throw error;
    }
  }

  static async getProductosConUmbral(idDeposito: number): Promise<InventarioProducto[]> {
    try {
      const { data } = await api.get(`/inventario/${idDeposito}/umbrales-config`);

      return (data as any[]).map((item) => {
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
      const { data } = await api.put(`/inventario/${idDeposito}/${idProducto}/umbral-min`, { umbralMin });
      return data;
    } catch (error) {
      console.error('Error en updateUmbralMin:', error);
      throw error;
    }
  }

  static async bulkUpdateUmbrales(idDeposito: number, items: { idProducto: number; umbralMin: number }[]): Promise<any> {
    try {
      const { data } = await api.put(`/inventario/${idDeposito}/umbrales`, { items });
      return data;
    } catch (error) {
      console.error('Error en bulkUpdateUmbrales:', error);
      throw error;
    }
  }

  static async getResumenEstados(idDeposito: number): Promise<{
    total: number; normal: number; bajo: number; critico: number; default: number;
  }> {
    try {
      const { data } = await api.get(`/inventario/${idDeposito}/resumen-estados`);
      const d = data || {};
      return {
        total: Number(d.total ?? 0),
        normal: Number(d.normal ?? 0),
        bajo: Number(d.bajo ?? 0),
        critico: Number(d.critico ?? 0),
        default: Number(d.default ?? 0),
      };
    } catch (error) {
      console.error('Error en getResumenEstados:', error);
      throw error;
    }
  }
}

export class InventarioGlobalService {
  static async getStockGlobal(): Promise<StockGlobalRow[]> {
    try {
      const { data } = await api.get('/inventario-global');
      const toHour = (s?: string | null): string | null => {
        if (!s) return null;
        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return null;
        return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      };
      const rows = (data as any[]).map((r) => ({
        ...r,
        updatedAt: r.updatedAt ?? null,
        horaActualizacion: toHour(r.updatedAt ?? null),
      })) as StockGlobalRow[];
      return rows;
    } catch (error) {
      console.error('Error en getStockGlobal:', error);
      throw error;
    }
  }

  static async getResumenEstadosGlobal(): Promise<InventarioGlobalResumen> {
    try {
      const { data } = await api.get('/inventario-global/resumen-estados');
      return data as InventarioGlobalResumen;
    } catch (error) {
      console.error('Error en getResumenEstadosGlobal:', error);
      throw error;
    }
  }
}
