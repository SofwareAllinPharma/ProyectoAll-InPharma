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
};
