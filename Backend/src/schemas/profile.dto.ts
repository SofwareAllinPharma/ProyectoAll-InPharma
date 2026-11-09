import { z } from 'zod';

export const UpdateProfileDto = z.object({
  dni: z.string().min(1, "El DNI es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  telefono: z.string().optional(),
});

export type TUpdateProfile = z.infer<typeof UpdateProfileDto>;
