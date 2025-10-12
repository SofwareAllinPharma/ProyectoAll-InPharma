import axios from 'axios';

export interface InventarioProducto {
  idProducto: number;
  nombreComercial: string;
  stockActual: number;
  umbralMin: number | null;
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
      return response.data;
    } catch (error) {
      console.error('Error en getInventarioByDeposito:', error);
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
}
