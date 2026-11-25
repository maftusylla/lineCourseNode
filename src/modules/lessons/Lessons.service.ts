
import { LessonRepository,type ILessonRepository,type CreateLessonRecord,type ListLessonsInput,
} from './lessons.repository.js'
import { Course } from '../courses/courses.model.js'
import type { UserRole } from '../users/user.model.js'
import { ForbiddenError, NotFoundError } from '../../shared/errors.js'
import { CourseRepository, type ICourseRepository } from '../courses/courses.repository.js'
import { ModuleRepository, type IModuleRepository } from '../modules/modules.repository.js'

export class LessonService {
  constructor(
    private readonly lessons: ILessonRepository = new LessonRepository(),
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
    moduleId: string,
    userId: string,
    role: UserRole,
    input: Omit<CreateLessonRecord, 'moduleId'>,
  ) {
    const module = await this.modules.findById(moduleId)

    if (!module) {
      throw new NotFoundError('Module introuvable.')
    }

    const course = await this.courses.findById(module.courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    this.checkOwnership(course, userId, role)

    return this.lessons.createLesson({
      titre: input.titre,
      contenu: input.contenu,
      moduleId,
    })
  }

  async listByModule(input: ListLessonsInput & {
    userId: string
    role: UserRole
  }) {
    const module = await this.modules.findById(input.moduleId)

    if (!module) {
      throw new NotFoundError('Module introuvable.')
    }

    const course = await this.courses.findById(module.courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    const isAdmin = input.role === 'admin'
    const isOwner = course.userId === input.userId
    const isPublished = course.status === 'published'

    if (!isAdmin && !isOwner && !isPublished) {
      throw new NotFoundError('Cours introuvable.')
    }

    const result = await this.lessons.list(input)

    return {
      lessons: result.rows,
      pagination: {
        page: input.page,
        per_page: input.perPage,
        total: result.count,
        total_pages: Math.ceil(result.count / input.perPage),
      },
    }
  }
}
