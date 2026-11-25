
import { z } from 'zod'

export const enrollmentCourseIdSchema = z.object({
  courseId: z.uuid({ error: 'Identifiant de cours invalide.' }),
})

export const updateLessonProgressParamsSchema = z.object({
  enrollmentId: z.uuid({
    error: "Identifiant d'inscription invalide.",
  }),
  lessonId: z.uuid({
    error: 'Identifiant de leçon invalide.',
  }),
})

export const updateLessonProgressBodySchema = z.object({
  progress: z.number()
    .int({ error: 'La progression doit être un nombre entier.' })
    .min(0, { error: 'La progression minimale est 0.' })
    .max(100, { error: 'La progression maximale est 100.' }),
})
export const enrollLearnerBodySchema = z.object({
  userId: z.uuid({
    error: "Identifiant de l'apprenant invalide.",
  }),
})