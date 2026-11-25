
import { z } from 'zod'

export const createModuleSchema = z.object({
  titre: z
    .string()
    .min(1, 'Le titre du module est obligatoire.')
    .max(120, 'Le titre ne doit pas dépasser 120 caractères.'),

  description: z
    .string()
    .min(1, 'La description du module est obligatoire.')
    .max(1000, 'La description ne doit pas dépasser 1000 caractères.'),
})


export const listModulesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
})

export const courseModuleIdSchema = z.object({
  id: z.uuid({ error: 'Identifiant du cours invalide.' }),
})
