import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { initializeModels } from '../../database/models.js'
import { Course } from '../courses/courses.model.js'
import type { ICourseRepository } from '../courses/courses.repository.js'
import { Module } from '../modules/modules.model.js'
import type { IModuleRepository } from '../modules/modules.repository.js'
import { Lesson } from './lessons.model.js'
import type { ILessonRepository, ListLessonsInput } from './lessons.repository.js'
import { LessonService } from './Lessons.service.js'

initializeModels()

class InMemoryCourseRepository implements ICourseRepository {
  readonly courses = new Map<string, Course>()
  async findById(id: string) { return this.courses.get(id) ?? null }
  async findPublishedById(id: string): Promise<Course | null> {
    const course = [...this.courses.values()].find(
      (course) => course.id === id && course.status === 'published',
    )

    return course ?? null
  }
  async create(data: { titre: string; description: string; userId: string }) {
    const course = Course.build({ id: randomUUID(), ...data }, { isNewRecord: false })
    this.courses.set(course.id, course)
    return course
  }
  async update(course: Course) { return course }
  async softDelete(_course: Course) {}
  async publish(course: Course) { course.set({ status: 'published' }); return course }
  async list() { return { rows: [], count: 0 } }
}

class InMemoryModuleRepository implements IModuleRepository {
  readonly modules = new Map<string, Module>()
  async create(data: { titre: string; description: string; courseId: string }) {
    const module = Module.build({ id: randomUUID(), ...data }, { isNewRecord: false })
    this.modules.set(module.id, module)
    return module
  }
  async findById(id: string) { return this.modules.get(id) ?? null }
  async list() { return { rows: [], count: 0 } }
}

class InMemoryLessonRepository implements ILessonRepository {
  readonly lessons = new Map<string, Lesson>()
  async createLesson(data: { titre: string; contenu: string; moduleId: string }) {
    const lesson = Lesson.build({ id: randomUUID(), ...data }, { isNewRecord: false })
    this.lessons.set(lesson.id, lesson)
    return lesson
  }
  async findById(id: string) { return this.lessons.get(id) ?? null }
  async list(input: ListLessonsInput) {
    const rows = [...this.lessons.values()].filter((lesson) => lesson.moduleId === input.moduleId)
    const count = rows.length
    const offset = (input.page - 1) * input.perPage
    return { rows: rows.slice(offset, offset + input.perPage), count }
  }
}

describe('LessonService', () => {
  let courses: InMemoryCourseRepository
  let modules: InMemoryModuleRepository
  let lessons: InMemoryLessonRepository
  let service: LessonService

  beforeEach(() => {
    courses = new InMemoryCourseRepository()
    modules = new InMemoryModuleRepository()
    lessons = new InMemoryLessonRepository()
    service = new LessonService(lessons, modules, courses)
  })

  it('crée une leçon dans un module du cours du propriétaire', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    const module = await modules.create({
      titre: 'Module',
      description: 'Description',
      courseId: course.id,
    })

    const lesson = await service.create(module.id, 'teacher-1', 'teacher', {
      titre: 'Variables',
      contenu: 'Contenu de la leçon',
    })

    expect(lesson).toMatchObject({
      titre: 'Variables',
      contenu: 'Contenu de la leçon',
      moduleId: module.id,
    })
  })

  it('refuse une leçon si le module n’existe pas', async () => {
    await expect(
      service.create(randomUUID(), 'teacher-1', 'teacher', {
        titre: 'Leçon',
        contenu: 'Contenu',
      }),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('refuse qu’un autre enseignant crée une leçon', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    const module = await modules.create({
      titre: 'Module',
      description: 'Description',
      courseId: course.id,
    })

    await expect(
      service.create(module.id, 'teacher-2', 'teacher', {
        titre: 'Leçon',
        contenu: 'Contenu',
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('liste les leçons d’un cours publié pour un learner', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    course.set({ status: 'published' })
    const module = await modules.create({
      titre: 'Module',
      description: 'Description',
      courseId: course.id,
    })
    await lessons.createLesson({
      titre: 'Leçon',
      contenu: 'Contenu',
      moduleId: module.id,
    })

    await expect(
      service.listByModule({
        moduleId: module.id,
        page: 1,
        perPage: 10,
        userId: 'learner-1',
        role: 'learner',
      }),
    ).resolves.toMatchObject({ lessons: [{ titre: 'Leçon' }] })
  })

  it('masque les leçons d’un brouillon à un learner', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    const module = await modules.create({
      titre: 'Module',
      description: 'Description',
      courseId: course.id,
    })

    await expect(
      service.listByModule({
        moduleId: module.id,
        page: 1,
        perPage: 10,
        userId: 'learner-1',
        role: 'learner',
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
