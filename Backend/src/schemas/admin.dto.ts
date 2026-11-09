import { z } from 'zod';

export const CreateUserDto = z.object({
  mail: z.string().email(),
  password: z.string().min(6),
  dni: z.string().min(1),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  telefono: z.string().optional(),
  roles: z.array(z.string()).min(1), // Array of role names
});

export const UpdateUserDto = z.object({
  dni: z.string().min(1),
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  telefono: z.string().optional(),
  roles: z.array(z.string()).min(1),
});

export type TCreateUser = z.infer<typeof CreateUserDto>;
export type TUpdateUser = z.infer<typeof UpdateUserDto>;
