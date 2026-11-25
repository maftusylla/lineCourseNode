import { describe, expect, it } from 'vitest'
import { createCourseSchema, listCoursesSchema, updateCourseSchema } from './courses/courses.schema.js'
import { createModuleSchema, listModulesSchema } from './modules/modules.schema.js'
import { createLessonSchema, listLessonsSchema } from './lessons/lessons.schema.js'

describe('validation des contenus pédagogiques', () => {
  it('valide la création d’un cours', () => {
    expect(createCourseSchema.safeParse({
      titre: 'Algorithmique',
      description: 'Bases des algorithmes',
    }).success).toBe(true)
    expect(createCourseSchema.safeParse({ titre: '', description: '' }).success).toBe(false)
  })

  it('refuse une modification de cours sans champ', () => {
    expect(updateCourseSchema.safeParse({}).success).toBe(false)
    expect(updateCourseSchema.safeParse({ titre: 'Nouveau titre' }).success).toBe(true)
  })

  it('applique les valeurs par défaut de pagination des cours', () => {
    expect(listCoursesSchema.parse({})).toMatchObject({ page: 1, per_page: 10 })
  })

  it('valide la création d’un module', () => {
    expect(createModuleSchema.safeParse({
      titre: 'Introduction',
      description: 'Premier module',
    }).success).toBe(true)
    expect(createModuleSchema.safeParse({ titre: '', description: '' }).success).toBe(false)
  })

  it('applique les limites de pagination des modules', () => {
    expect(listModulesSchema.parse({ page: '2', per_page: '20' })).toMatchObject({
      page: 2,
      per_page: 20,
    })
    expect(listModulesSchema.safeParse({ per_page: 101 }).success).toBe(false)
  })

  it('valide la création d’une leçon', () => {
    expect(createLessonSchema.safeParse({
      titre: 'Variables',
      contenu: 'Contenu de la leçon',
    }).success).toBe(true)
    expect(createLessonSchema.safeParse({ titre: '', contenu: '' }).success).toBe(false)
  })

  it('applique les valeurs par défaut de pagination des leçons', () => {
    expect(listLessonsSchema.parse({})).toMatchObject({ page: 1, per_page: 10 })
  })
})
