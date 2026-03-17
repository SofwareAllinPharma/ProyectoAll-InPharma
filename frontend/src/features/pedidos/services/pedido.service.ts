import { api } from '../../../lib/api';
import type {
  Pedido,
  CreatePedidoRequest,
  TomarPedidoRequest,
} from "../types/pedido.types";

class PedidoServiceClass {
  async list(pagina = 1, pageSize = 50): Promise<Pedido[]> {
    const q = `?pagina=${pagina}&pageSize=${pageSize}`;
    const { data } = await api.get(`/pedidos${q}`);
    if (data && Array.isArray(data.items)) return data.items as Pedido[];
    if (Array.isArray(data)) return data as Pedido[];
    return [] as Pedido[];
  }

  async detail(id: number): Promise<Pedido> {
    const { data } = await api.get(`/pedidos/${id}`);
    return data;
  }

  async create(dto: CreatePedidoRequest): Promise<Pedido> {
    const { data } = await api.post('/pedidos', dto);
    return data;
  }

  async tomar(id: number, dto: TomarPedidoRequest): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${id}/tomar`, dto);
    return data;
  }

  async tomarPedido(numPedido: number): Promise<Pedido> {
    // Nota: Idealmente el backend debería saber quién es el usuario por el token,
    // pero si tu endpoint requiere estos campos en el body, los enviamos.
    // Si el backend ya usa req.user, esto podría simplificarse.
    const userMail = localStorage.getItem("userMail") || "tecnico@aip.com";
    const userPerfil = Number(localStorage.getItem("userPerfil")) || 1;

    const { data } = await api.post(`/pedidos/${numPedido}/tomar`, {
      mailUsuarioCocinero: userMail,
      idPerfilCocinero: userPerfil,
    });
    return data;
  }

  async iniciarElaboracion(numPedido: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${numPedido}/iniciar-elaboracion`);
    return data;
  }

  async finalizarElaboracion(numPedido: number, cantidadRealPaquetes: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${numPedido}/finalizar-elaboracion`, { cantidadRealPaquetes });
    return data;
  }

  async aprobarPedido(numPedido: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${numPedido}/aprobar`);
    return data;
  }

  async rechazarPedido(numPedido: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${numPedido}/rechazar`);
    return data;
  }

  async finalizar(id: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${id}/finalizar`);
    return data;
  }

  async cancelar(id: number): Promise<Pedido> {
    const { data } = await api.post(`/pedidos/${id}/cancelar`);
    return data;
  }
}

export const PedidoService = new PedidoServiceClass();
