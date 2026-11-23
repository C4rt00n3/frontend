import { z } from "zod";

// Espelha as validações do backend (LoginRequest / CreateUserRequest).
const email = z.string().trim().min(1, "Informe seu e-mail.").max(254, "E-mail muito longo.").email("E-mail inválido.");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Informe seu nome.").max(120, "Use até 120 caracteres."),
    email,
    password: z.string().min(6, "Use pelo menos 6 caracteres.").max(72, "Use até 72 caracteres."),
    confirm: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirm, {
    path: ["confirm"],
    message: "As senhas não coincidem.",
  });

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome.").max(120, "Use até 120 caracteres."),
  email,
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;
