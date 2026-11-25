
import { z } from 'zod'

export const createLessonSchema = z.object({
  titre: z
    .string()
    .min(1, 'Le titre de la leçon est obligatoire.')
    .max(120, 'Le titre ne doit pas dépasser 120 caractères.'),

  contenu: z
    .string()
    .min(1, 'Le contenu de la leçon est obligatoire.'),
})

export const listLessonsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(100).default(10),
})

export const moduleIdSchema = z.object({
  moduleId: z.uuid({ error: 'Identifiant du module invalide.' }),
})
