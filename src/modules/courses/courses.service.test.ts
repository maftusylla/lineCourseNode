import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { initializeModels } from '../../database/models.js'
import { Course } from './courses.model.js'
import type {
  CreateCoursesRecord,
  ICourseRepository,
  ListCoursesInput,
  UpdateCourseRecord,
} from './courses.repository.js'
import { CourseService } from './courses.services.js'

initializeModels()

class InMemoryCourseRepository implements ICourseRepository {
  readonly courses = new Map<string, Course>()

  async findById(id: string) {
    return this.courses.get(id) ?? null
  }

  async findPublishedById(id: string): Promise<Course | null> {
    const course = [...this.courses.values()].find(
      (course) => course.id === id && course.status === 'published',
    )

    return course ?? null
  }

  async create(data: CreateCoursesRecord) {
    const course = Course.build(
      {
        id: randomUUID(),
        titre: data.titre,
        description: data.description,
        status: 'draft',
        userId: data.userId,
      },
      { isNewRecord: false },
    )
    this.courses.set(course.id, course)
    return course
  }

  async update(course: Course, data: UpdateCourseRecord) {
    course.set(data)
    return course
  }

  async softDelete(course: Course) {
    course.set({ deletedAt: new Date() })
  }

  async publish(course: Course) {
    course.set({ status: 'published' })
    return course
  }

  async list(input: ListCoursesInput) {
    let rows = [...this.courses.values()]
    if (input.role === 'learner') rows = rows.filter((course) => course.status === 'published')
    if (input.role === 'teacher') {
      rows = rows.filter(
        (course) => course.status === 'published' || course.userId === input.userId,
      )
    }
    const count = rows.length
    const offset = (input.page - 1) * input.perPage
    return { rows: rows.slice(offset, offset + input.perPage), count }
  }
}

describe('CourseService', () => {
  let courses: InMemoryCourseRepository
  let service: CourseService

  beforeEach(() => {
    courses = new InMemoryCourseRepository()
    service = new CourseService(courses)
  })

  it('crée un cours avec le propriétaire demandé', async () => {
    const course = await service.create('teacher-1', {
      titre: 'Algorithmes',
      description: 'Structures et algorithmes',
    })

    expect(course).toMatchObject({
      titre: 'Algorithmes',
      description: 'Structures et algorithmes',
      userId: 'teacher-1',
      status: 'draft',
    })
  })

  it('limite la liste aux cours publiés pour un learner', async () => {
    const draft = await courses.create({
      titre: 'Brouillon',
      description: 'Non publié',
      userId: 'teacher-1',
    })
    await courses.publish(await courses.create({
      titre: 'Publié',
      description: 'Visible',
      userId: 'teacher-1',
    }))

    const result = await service.list({
      page: 1,
      perPage: 10,
      role: 'learner',
      userId: 'learner-1',
    })

    expect(result.courses).toHaveLength(1)
    expect(result.courses[0]?.titre).toBe('Publié')
    expect(result.courses).not.toContain(draft)
  })

  it('refuse à un learner de consulter un brouillon', async () => {
    const course = await courses.create({
      titre: 'Brouillon',
      description: 'Privé',
      userId: 'teacher-1',
    })

    await expect(
      service.getById(course.id, 'learner-1', 'learner'),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('autorise le propriétaire à modifier son cours', async () => {
    const course = await courses.create({
      titre: 'Ancien titre',
      description: 'Description',
      userId: 'teacher-1',
    })

    const updated = await service.update(course.id, 'teacher-1', 'teacher', {
      titre: 'Nouveau titre',
    })

    expect(updated.titre).toBe('Nouveau titre')
  })

  it('refuse qu’un autre enseignant modifie ou supprime un cours', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    await expect(
      service.update(course.id, 'teacher-2', 'teacher', { titre: 'Interdit' }),
    ).rejects.toMatchObject({ status: 403 })
    await expect(
      service.softDelete(course.id, 'teacher-2', 'teacher'),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('publie uniquement un brouillon', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    const published = await service.publish(course.id, 'teacher-1', 'teacher')
    expect(published.status).toBe('published')
    await expect(
      service.publish(course.id, 'teacher-1', 'teacher'),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('autorise un admin sur tous les cours', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })

    await expect(
      service.update(course.id, 'admin-1', 'admin', { description: 'Modifiée' }),
    ).resolves.toMatchObject({ description: 'Modifiée' })
  })

  it('n’autorise pas la suppression d’un cours publié', async () => {
    const course = await courses.create({
      titre: 'Cours',
      description: 'Description',
      userId: 'teacher-1',
    })
    await courses.publish(course)

    await expect(
      service.softDelete(course.id, 'teacher-1', 'teacher'),
    ).rejects.toMatchObject({ status: 409 })
  })
})
