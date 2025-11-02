import type {
  Pedido,
  CreatePedidoRequest,
  TomarPedidoRequest,
} from "../types/pedido.types";
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

class PedidoServiceClass {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      const msg = err?.error || err?.message || `Error ${res.status}`;
      throw new Error(msg);
    }
    return res.json();
  }

  async list(pagina = 1, pageSize = 50): Promise<Pedido[]> {
    const q = `?pagina=${pagina}&pageSize=${pageSize}`;
    const res = await this.request<any>(`/pedidos${q}`);
    // Backend returns { items, total, pagina, pageSize, paginas }
    if (res && Array.isArray(res.items)) return res.items as Pedido[];
    if (Array.isArray(res)) return res as Pedido[];
    return [] as Pedido[];
  }

  async detail(id: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${id}`);
  }

  async create(dto: CreatePedidoRequest): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  async tomar(id: number, dto: TomarPedidoRequest): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${id}/tomar`, {
      method: "POST",
      body: JSON.stringify(dto),
    });
  }

  // Métodos simplificados para las acciones del workflow
  async tomarPedido(numPedido: number): Promise<Pedido> {
    const userMail = localStorage.getItem("userMail") || "tecnico@aip.com";
    const userPerfil = Number(localStorage.getItem("userPerfil")) || 1;

    // Backend espera { mailUsuarioCocinero, idPerfilCocinero }
    return this.request<Pedido>(`/pedidos/${numPedido}/tomar`, {
      method: "POST",
      body: JSON.stringify({
        mailUsuarioCocinero: userMail,
        idPerfilCocinero: userPerfil,
      }),
    });
  }

  async iniciarElaboracion(numPedido: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${numPedido}/iniciar-elaboracion`, {
      method: "POST",
    });
  }

  async finalizarElaboracion(numPedido: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${numPedido}/finalizar-elaboracion`, {
      method: "POST",
    });
  }

  async aprobarPedido(numPedido: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${numPedido}/aprobar`, {
      method: "POST",
    });
  }

  async rechazarPedido(numPedido: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${numPedido}/rechazar`, {
      method: "POST",
    });
  }

  async finalizar(id: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${id}/finalizar`, { method: "POST" });
  }

  async cancelar(id: number): Promise<Pedido> {
    return this.request<Pedido>(`/pedidos/${id}/cancelar`, { method: "POST" });
  }
}

export const PedidoService = new PedidoServiceClass();
