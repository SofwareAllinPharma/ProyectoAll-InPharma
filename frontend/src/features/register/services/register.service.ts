import { api } from "../../../lib/api";

export interface CreateUserDto {
  mail: string;
  password: string;
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
}

export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface User {
  mail: string;
  dni?: string;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  activo?: boolean;
  roles: string[];
}

export interface UpdateUserDto {
  dni: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  roles: string[];
}

export const registerService = {
  registerUser: async (data: CreateUserDto) => {
    const response = await api.post("/admin-sis/users", data);
    return response.data;
  },

  updateUser: async (mail: string, data: UpdateUserDto) => {
    const response = await api.put(`/admin-sis/users/${mail}`, data);
    return response.data;
  },

  getRoles: async () => {
    const response = await api.get<Role[]>("/admin-sis/roles");
    return response.data;
  },

  getUsers: async () => {
    const response = await api.get<User[]>("/admin-sis/users");
    return response.data;
  }
  ,

  deactivateUser: async (mail: string) => {
    // NOTE: backend needs to expose an endpoint to logically deactivate a user.
    // We call a dedicated endpoint here; if your backend uses a different path/method,
    // adjust accordingly.
    const response = await api.post(`/admin-sis/users/${encodeURIComponent(mail)}/deactivate`);
    return response.data;
  }
  ,

  activateUser: async (mail: string) => {
    const response = await api.post(`/admin-sis/users/${encodeURIComponent(mail)}/activate`);
    return response.data;
  }
};
