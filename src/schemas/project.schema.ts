import { z } from "zod";

// Limites iguais aos de CreateProjectRequest no backend.
export const PROJECT_LIMITS = { name: 120, description: 1000, objective: 500 } as const;

export const projectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Dê um nome ao projeto.")
    .max(PROJECT_LIMITS.name, `Use até ${PROJECT_LIMITS.name} caracteres.`),
  description: z.string().trim().max(PROJECT_LIMITS.description, `Use até ${PROJECT_LIMITS.description} caracteres.`),
  objective: z.string().trim().max(PROJECT_LIMITS.objective, `Use até ${PROJECT_LIMITS.objective} caracteres.`),
});

export type ProjectValues = z.infer<typeof projectSchema>;
