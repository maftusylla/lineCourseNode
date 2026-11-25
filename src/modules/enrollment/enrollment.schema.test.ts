import { describe, expect, it } from 'vitest'
import {
  enrollmentCourseIdSchema,
  enrollLearnerBodySchema,
  updateLessonProgressBodySchema,
  updateLessonProgressParamsSchema,
} from './enrollment.schema.js'

describe('validation Enrollment', () => {
  const courseId = '927d26c0-c408-4d9e-90d3-459b5d0ea790'
  const enrollmentId = '2fe40c63-ce86-48b3-baf5-af39002e36bd'
  const lessonId = '9aa7a45d-7d58-4263-bcb5-0b40f24aaabc'
  const learnerId = '4a6d59df-4e50-4a8a-bc19-487c9e7eae3c'

  it('valide l’identifiant du cours', () => {
    expect(enrollmentCourseIdSchema.safeParse({ courseId }).success).toBe(true)
    expect(enrollmentCourseIdSchema.safeParse({ courseId: 'invalide' }).success).toBe(false)
  })

  it('valide les identifiants de progression', () => {
    expect(updateLessonProgressParamsSchema.safeParse({
      enrollmentId,
      lessonId,
    }).success).toBe(true)
  })

  it('borne la progression entre 0 et 100', () => {
    expect(updateLessonProgressBodySchema.safeParse({ progress: 0 }).success).toBe(true)
    expect(updateLessonProgressBodySchema.safeParse({ progress: 100 }).success).toBe(true)
    expect(updateLessonProgressBodySchema.safeParse({ progress: -1 }).success).toBe(false)
    expect(updateLessonProgressBodySchema.safeParse({ progress: 101 }).success).toBe(false)
    expect(updateLessonProgressBodySchema.safeParse({ progress: 12.5 }).success).toBe(false)
  })

  it('valide l’identifiant de l’apprenant à inscrire', () => {
    expect(enrollLearnerBodySchema.safeParse({ userId: learnerId }).success).toBe(true)
    expect(enrollLearnerBodySchema.safeParse({ userId: 'invalide' }).success).toBe(false)
  })
})
