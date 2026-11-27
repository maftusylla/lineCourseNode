import { randomUUID } from 'node:crypto'
import { beforeEach, describe, expect, it } from 'vitest'
import { initializeModels } from '../../database/models.js'
import { Course } from '../courses/courses.model.js'
import { Lesson } from '../lessons/lessons.model.js'
import { Module } from '../modules/modules.model.js'
import { User } from '../users/user.model.js'
import { Enrollment } from './enrollment.model.js'
import { LessonProgress } from './lesson-progress.model.js'
import { EnrollmentService } from './enrollment.service.js'

initializeModels()

class InMemoryEnrollmentRepository {
  readonly courses = new Map<string, Course>()
  readonly users = new Map<string, User>()
  readonly modules = new Map<string, Module>()
  readonly lessons = new Map<string, Lesson>()
  readonly enrollments = new Map<string, Enrollment>()
  readonly lessonProgress = new Map<string, LessonProgress>()

  async findCourseById(id: string) {
    return this.courses.get(id) ?? null
  }

  async findUserById(id: string) {
    return this.users.get(id) ?? null
  }

  async findEnrollmentById(id: string) {
    return this.enrollments.get(id) ?? null
  }

  async findLessonById(id: string) {
    return this.lessons.get(id) ?? null
  }

  async findModuleById(id: string) {
    return this.modules.get(id) ?? null
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return [...this.enrollments.values()].find(
      (enrollment) => enrollment.userId === userId && enrollment.courseId === courseId,
    ) ?? null
  }

  async create(userId: string, courseId: string) {
    const enrollment = Enrollment.build(
      { id: randomUUID(), userId, courseId },
      { isNewRecord: false },
    )
    this.enrollments.set(enrollment.id, enrollment)
    return enrollment
  }

  async findByCourse(courseId: string) {
    return [...this.enrollments.values()].filter(
      (enrollment) => enrollment.courseId === courseId,
    )
  }

  async findLessonProgress(enrollmentId: string, lessonId: string) {
    const key = `${enrollmentId}:${lessonId}`
    return this.lessonProgress.get(key) ?? null
  }

  async createLessonProgress(enrollmentId: string, lessonId: string, progress: number) {
    const value = LessonProgress.build(
      { id: randomUUID(), enrollmentId, lessonId, progress },
      { isNewRecord: false },
    )
    this.lessonProgress.set(`${enrollmentId}:${lessonId}`, value)
    return value
  }

  async updateLessonProgress(value: LessonProgress, progress: number) {
    value.set({ progress })
    return value
  }
  async findByUser(userId: string) {
    return [...this.enrollments.values()].filter(
      (enrollment) => enrollment.userId === userId,
    )
  }

  addCourse(userId: string, status: 'draft' | 'published' = 'draft') {
    const course = Course.build(
      {
        id: randomUUID(),
        titre: 'Cours',
        description: 'Description',
        status,
        userId,
      },
      { isNewRecord: false },
    )
    this.courses.set(course.id, course)
    return course
  }

  addUser(role: 'admin' | 'teacher' | 'learner') {
    const user = User.build(
      {
        id: randomUUID(),
        name: 'Utilisateur',
        email: `${randomUUID()}@example.test`,
        passwordHash: 'hash',
        role,
        isActive: true,
        emailVerifiedAt: new Date(),
        authVersion: 1,
      },
      { isNewRecord: false },
    )
    this.users.set(user.id, user)
    return user
  }

  addModule(courseId: string) {
    const module = Module.build(
      { id: randomUUID(), titre: 'Module', description: 'Description', courseId },
      { isNewRecord: false },
    )
    this.modules.set(module.id, module)
    return module
  }

  addLesson(moduleId: string) {
    const lesson = Lesson.build(
      { id: randomUUID(), titre: 'Leçon', contenu: 'Contenu', moduleId },
      { isNewRecord: false },
    )
    this.lessons.set(lesson.id, lesson)
    return lesson
  }
}

describe('EnrollmentService', () => {
  let repository: InMemoryEnrollmentRepository
  let service: EnrollmentService

  beforeEach(() => {
    repository = new InMemoryEnrollmentRepository()
    service = new EnrollmentService(repository)
  })

  it('inscrit un learner à un cours existant', async () => {
    const course = repository.addCourse('teacher-1', 'published')

    const enrollment = await service.enroll('learner-1', course.id)

    expect(enrollment).toMatchObject({ userId: 'learner-1', courseId: course.id })
  })

  it('refuse l’inscription à un cours introuvable', async () => {
    await expect(service.enroll('learner-1', randomUUID())).rejects.toMatchObject({
      status: 404,
    })
  })

  it('refuse une inscription déjà existante', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    await service.enroll('learner-1', course.id)

    await expect(service.enroll('learner-1', course.id)).rejects.toMatchObject({
      status: 409,
    })
  })

  it('liste les inscriptions d’un cours existant', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    await service.enroll('learner-1', course.id)

    await expect(
      service.getEnrollments(course.id, 'teacher-1', 'teacher'),
    ).resolves.toHaveLength(1)
  })

  it('crée puis met à jour la progression d’une leçon', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const module = repository.addModule(course.id)
    const lesson = repository.addLesson(module.id)
    const enrollment = await service.enroll('learner-1', course.id)

    const created = await service.updateLessonProgress(
      'learner-1',
      enrollment.id,
      lesson.id,
      25,
    )
    expect(created.progress).toBe(25)

    const updated = await service.updateLessonProgress(
      'learner-1',
      enrollment.id,
      lesson.id,
      75,
    )
    expect(updated.progress).toBe(75)
  })

  it('refuse la progression d’une inscription appartenant à un autre learner', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const module = repository.addModule(course.id)
    const lesson = repository.addLesson(module.id)
    const enrollment = await service.enroll('learner-1', course.id)

    await expect(
      service.updateLessonProgress('learner-2', enrollment.id, lesson.id, 50),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('refuse une inscription ou une leçon introuvable', async () => {
    await expect(
      service.updateLessonProgress('learner-1', randomUUID(), randomUUID(), 50),
    ).rejects.toMatchObject({ status: 404 })

    const course = repository.addCourse('teacher-1', 'published')
    const enrollment = await service.enroll('learner-1', course.id)
    await expect(
      service.updateLessonProgress('learner-1', enrollment.id, randomUUID(), 50),
    ).rejects.toMatchObject({ status: 404 })
  })

  it('refuse une leçon qui n’appartient pas au cours inscrit', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const otherCourse = repository.addCourse('teacher-1', 'published')
    const module = repository.addModule(otherCourse.id)
    const lesson = repository.addLesson(module.id)
    const enrollment = await service.enroll('learner-1', course.id)

    await expect(
      service.updateLessonProgress('learner-1', enrollment.id, lesson.id, 50),
    ).rejects.toMatchObject({ status: 403 })
  })

  it('permet à un administrateur d’inscrire explicitement un learner', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const learner = repository.addUser('learner')

    const enrollment = await service.enrollLearner(course.id, learner.id,'admin-1','admin')

    expect(enrollment).toMatchObject({ userId: learner.id, courseId: course.id })
  })

  it('valide le cours, l’utilisateur et son rôle lors d’une inscription administrative', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const teacher = repository.addUser('teacher')

    await expect(
      service.enrollLearner(randomUUID(), randomUUID(), 'admin-1', 'admin'),
    ).rejects.toMatchObject({ status: 404 })
    await expect(
      service.enrollLearner(course.id, randomUUID(), 'admin-1', 'admin'),
    ).rejects.toMatchObject({ status: 404 })
    await expect(
      service.enrollLearner(course.id, teacher.id, 'admin-1', 'admin'),
    ).rejects.toMatchObject({ status: 409 })
  })

  it('refuse une double inscription administrative', async () => {
    const course = repository.addCourse('teacher-1', 'published')
    const learner = repository.addUser('learner')
    await service.enrollLearner(course.id, learner.id, 'admin-1', 'admin')
    await expect(
      service.enrollLearner(course.id, learner.id, 'admin-1', 'admin'),
    ).rejects.toMatchObject({ status: 409 })
  })

it('refuse l’inscription à une formation non publiée', async () => {
  const course = repository.addCourse('teacher-1', 'draft')

  await expect(
    service.enroll('learner-1', course.id),
  ).rejects.toMatchObject({
    status: 409,
  })
})

it('empêche un enseignant de gérer les inscriptions d’un autre enseignant', async () => {
  const course = repository.addCourse('teacher-1', 'published')
  const learner = repository.addUser('learner')

  await expect(
    service.getEnrollments(course.id, 'teacher-2', 'teacher'),
  ).rejects.toMatchObject({
    status: 403,
  })

  await expect(
    service.enrollLearner(
      course.id,
      learner.id,
      'teacher-2',
      'teacher',
    ),
  ).rejects.toMatchObject({
    status: 403,
  })
})

})
