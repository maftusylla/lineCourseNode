
import {CourseRepository,type ICourseRepository,type CreateCoursesRecord,type ListCoursesInput,type UpdateCourseRecord,
} from './courses.repository.js'
import { Course } from './courses.model.js'
import type { UserRole } from '../users/user.model.js'
import {ConflictError,ForbiddenError,NotFoundError,
} from '../../shared/errors.js'

export class CourseService {
  constructor(
    private readonly courses: ICourseRepository = new CourseRepository(),
  ) {}

  private checkOwnership(course: Course, userId: string, role: UserRole) {
    if (role === 'admin') return

    if (role !== 'teacher') {
      throw new ForbiddenError()
    }

    if (course.userId !== userId) {
      throw new ForbiddenError('Vous ne pouvez gérer que vos propres cours.')
    }
  }

  async create(userId: string, input: Omit<CreateCoursesRecord, 'userId'>) {
    return this.courses.create({
      titre: input.titre,
      description: input.description,
      userId,
    })
  }

  async list(input: ListCoursesInput) {
    const result = await this.courses.list(input)

    return {
      courses: result.rows,
      pagination: {
        page: input.page,
        per_page: input.perPage,
        total: result.count,
        total_pages: Math.ceil(result.count / input.perPage),
      },
    }
  }

  async getById(id: string, userId: string, role: UserRole) {
    const course = await this.courses.findById(id)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    const isAdmin = role === 'admin'
    const isOwner = course.userId === userId
    const isPublished = course.status === 'published'

    if (!isAdmin && !isOwner && !isPublished) {
      throw new NotFoundError('Cours introuvable.')
    }

    return course
  }

  async update(
    id: string,
    userId: string,
    role: UserRole,
    input: UpdateCourseRecord,
  ) {
    const course = await this.courses.findById(id)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    this.checkOwnership(course, userId, role)

    return this.courses.update(course, input)
  }

  async softDelete(id: string, userId: string, role: UserRole) {
    const course = await this.courses.findById(id)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    this.checkOwnership(course, userId, role)

    if (course.status !== 'draft') {
      throw new ConflictError('Seuls les brouillons peuvent être supprimés.')
    }

    await this.courses.softDelete(course)

    return { message: 'Cours supprimé avec succès.' }
  }

  async publish(id: string, userId: string, role: UserRole) {
    const course = await this.courses.findById(id)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    this.checkOwnership(course, userId, role)

    if (course.status !== 'draft') {
      throw new ConflictError('Seuls les brouillons peuvent être publiés.')
    }

    return this.courses.publish(course)
  }
}
