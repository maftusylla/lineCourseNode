import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { initializeModels } from '../../database/models.js'
import { Course } from '../courses/courses.model.js'
import type { ICourseRepository } from '../courses/courses.repository.js'
import { Module } from './modules.model.js'
import type { IModuleRepository, ListModulesInput } from './modules.repository.js'
import { ModuleService } from './modules.service.js'

initializeModels()

class InMemoryModuleRepository implements IModuleRepository {
  readonly modules = new Map<string, Module>()

  async create(data: { titre: string; description: string; courseId: string }) {
    const module = Module.build(
      { id: randomUUID(), ...data },
      { isNewRecord: false },
    )
    this.modules.set(module.id, module)
    return module
  }

  async findById(id: string) {
    return this.modules.get(id) ?? null
  }

  async list(input: ListModulesInput) {
    const rows = [...this.modules.values()].filter((module) => module.courseId === input.courseId)
    const count = rows.length
    const offset = (input.page - 1) * input.perPage
    return { rows: rows.slice(offset, offset + input.perPage), count }
  }
}

class InMemoryCourseRepository implements ICourseRepository {
  readonly courses = new Map<string, Course>()

  async findById(id: string) {
    return this.courses.get(id) ?? null
  }

  async create(data: { titre: string; description: string; userId: string }) {
    const course = Course.build({ id: randomUUID(), ...data }, { isNewRecord: false })
    this.courses.set(course.id, course)
    return course
  }

  async update(course: Course) {
    return course
  }
  async softDelete(_course: Course) {}
  async publish(course: Course) {
    course.set({ status: 'published' })
    return course
  }
  async list() {
    return { rows: [], count: 0 }
  }
}

describe('ModuleService', () => {
  let courses: InMemoryCourseRepository
  let modules: InMemoryModuleRepository
  let service: ModuleService

  beforeEach(() => {
    courses = new InMemoryCourseRepository()
    modules = new InMemoryModuleRepository()
    service = new ModuleService(modules, courses)
  })

  it('crée un module dans un cours du propriétaire', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    const module = await service.create(course.id, 'teacher-1', 'teacher', {
      titre: 'Introduction',
      description: 'Premier module',
    })

    expect(module).toMatchObject({
      titre: 'Introduction',
      courseId: course.id,
    })
  })

  it('refuse la création pour un enseignant non propriétaire', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    await expect(
      service.create(course.id, 'teacher-2', 'teacher', {
        titre: 'Module',
        description: 'Description',
      }),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('liste les modules d’un cours publié pour un learner', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    course.set({ status: 'published' })
    await modules.create({ titre: 'Module', description: 'Description', courseId: course.id })

    await expect(
      service.listByCourse({
        courseId: course.id,
        page: 1,
        perPage: 10,
        userId: 'learner-1',
        role: 'learner',
      }),
    ).resolves.toMatchObject({ modules: [{ titre: 'Module' }] })
  })

  it('masque les modules d’un brouillon à un learner', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    await expect(
      service.listByCourse({
        courseId: course.id,
        page: 1,
        perPage: 10,
        userId: 'learner-1',
        role: 'learner',
      }),
    ).rejects.toMatchObject({ status: 404 })
  })
})
