
import {ModuleRepository,type IModuleRepository,type CreateModuleRecord,type ListModulesInput,
} from './modules.repository.js'
import { CourseRepository, type ICourseRepository } from '../courses/courses.repository.js'
import { Course } from '../courses/courses.model.js'
import type { UserRole } from '../users/user.model.js'
import { ForbiddenError, NotFoundError } from '../../shared/errors.js'

export class ModuleService {
  constructor(
    private readonly modules: IModuleRepository = new ModuleRepository(),
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

  async create(
    courseId: string,
    userId: string,
    role: UserRole,
    input: Omit<CreateModuleRecord, 'courseId'>,
  ) {
    const course = await this.courses.findById(courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    this.checkOwnership(course, userId, role)

    return this.modules.create({
      titre: input.titre,
      description: input.description,
      courseId,
    })
  }

  async listByCourse(input: ListModulesInput & {
    userId: string
    role: UserRole
  }) {
    const course = await this.courses.findById(input.courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    const isAdmin = input.role === 'admin'
    const isOwner = course.userId === input.userId
    const isPublished = course.status === 'published'

    if (!isAdmin && !isOwner && !isPublished) {
      throw new NotFoundError('Cours introuvable.')
    }

    const result = await this.modules.list(input)

    return {
      modules: result.rows,
      pagination: {
        page: input.page,
        per_page: input.perPage,
        total: result.count,
        total_pages: Math.ceil(result.count / input.perPage),
      },
    }
  }
}
