import { z } from 'zod';

// Zod es una librería de validación para TypeScript/JS.
// Te permite definir un esquema de cómo deben ser los datos y luego validarlos en runtime.
// Así te asegurás de que req.body tenga la forma correcta antes de guardarlo en la BD.

export const RegisterDto = z.object({
  mail: z.string().email(),
  password: z.string().min(6),
  dni: z.string().optional(),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  telefono: z.string().optional(),
});

export const LoginDto = z.object({
  mail: z.string().email(),
  password: z.string().min(1),
});

export const ForgotDto = z.object({
  mail: z.string().email(),
});

export const ResetDto = z.object({
  mail: z.string().email(),
  token: z.string().min(6),
  newPassword: z.string().min(6),
});

export type TRegister = z.infer<typeof RegisterDto>;
export type TLogin = z.infer<typeof LoginDto>;
export type TForgot = z.infer<typeof ForgotDto>;
export type TReset = z.infer<typeof ResetDto>;
