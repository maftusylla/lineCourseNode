
import { EnrollmentRepository } from './enrollment.repository.js'
import { ConflictError,ForbiddenError,NotFoundError} from '../../shared/errors.js'

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository = new EnrollmentRepository(),
  ) {}

  async enroll(userId: string, courseId: string) {
    const course = await this.enrollmentRepository.findCourseById(courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

    if (existingEnrollment) {
      throw new ConflictError('Vous êtes déjà inscrit à ce cours.')
    }

    return this.enrollmentRepository.create(userId, courseId)
  }

  async getEnrollments(courseId: string) {
    const course = await this.enrollmentRepository.findCourseById(courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }

    return this.enrollmentRepository.findByCourse(courseId)
  }

  async updateLessonProgress(
    userId: string,
    enrollmentId: string,
    lessonId: string,
    progress: number,
  ) {
    const enrollment =
      await this.enrollmentRepository.findEnrollmentById(enrollmentId)

    if (!enrollment) {
      throw new NotFoundError('Inscription introuvable.')
    }

    if (enrollment.userId !== userId) {
      throw new ForbiddenError(
        'Vous ne pouvez pas modifier cette progression.',
      )
    }

    const lesson = await this.enrollmentRepository.findLessonById(lessonId)

    if (!lesson) {
      throw new NotFoundError('Leçon introuvable.')
    }

    const module = await this.enrollmentRepository.findModuleById(
      lesson.moduleId,
    )

    if (module?.courseId !== enrollment.courseId) {
      throw new ForbiddenError(
        'Cette leçon ne correspond pas au cours de votre inscription.',
      )
    }

    const existingProgress =
      await this.enrollmentRepository.findLessonProgress(
        enrollmentId,
        lessonId,
      )

    if (existingProgress) {
      return this.enrollmentRepository.updateLessonProgress(
        existingProgress,
        progress,
      )
    }

    return this.enrollmentRepository.createLessonProgress(
      enrollmentId,
      lessonId,
      progress,
    )
  }
  async enrollLearner(courseId: string, userId: string) {
  const course = await this.enrollmentRepository.findCourseById(courseId)

  if (!course) {
    throw new NotFoundError('Cours introuvable.')
  }

  const user = await this.enrollmentRepository.findUserById(userId)

  if (!user) {
    throw new NotFoundError('Utilisateur introuvable.')
  }

  if (user.role !== 'learner') {
    throw new ConflictError('Cet utilisateur n’est pas un apprenant.')
  }

  const existingEnrollment =
    await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

  if (existingEnrollment) {
    throw new ConflictError('Cet apprenant est déjà inscrit à ce cours.')
  }

  return this.enrollmentRepository.create(userId, courseId)
}

  async getMyEnrollments(userId: string){
    return this.enrollmentRepository.findByUser(userId)
  }
}
