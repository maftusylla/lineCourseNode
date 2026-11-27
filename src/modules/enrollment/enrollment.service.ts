
import { EnrollmentRepository } from './enrollment.repository.js'
import { ConflictError,ForbiddenError,NotFoundError} from '../../shared/errors.js'
import type { UserRole } from '../users/user.model.js'
import type { Course } from '../courses/courses.model.js'

export class EnrollmentService {
  constructor(
    private readonly enrollmentRepository = new EnrollmentRepository(),
  ) {}

  private checkPublishedCourse(course:Course){
    if(course.status !=='published'){
      throw new ConflictError('Cette formation n \'est pas ouverte aux inscriptions')
    }
  }
  private checkCourseManagement(course: Course,actorId: string,actorRole: UserRole){
    if(actorRole==='admin') return
    if(actorRole !== 'teacher' || course.userId !==actorId){
            throw new ForbiddenError(  'Vous ne pouvez gérer que les inscriptions de vos propres formations.')

    }

  }
  async enroll(userId: string, courseId: string) {
    const course = await this.enrollmentRepository.findCourseById(courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }
    this.checkPublishedCourse(course)

    const existingEnrollment =
      await this.enrollmentRepository.findByUserAndCourse(userId, courseId)

    if (existingEnrollment) {
      throw new ConflictError('Vous êtes déjà inscrit à ce cours.')
    }

    return this.enrollmentRepository.create(userId, courseId)
  }

  async getEnrollments(courseId: string,actorId:string, actorRole:UserRole) {
    const course = await this.enrollmentRepository.findCourseById(courseId)

    if (!course) {
      throw new NotFoundError('Cours introuvable.')
    }
    this.checkCourseManagement(course,actorId,actorRole)

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
  async enrollLearner(courseId: string, learnerId: string,actorId:string,actorRole:UserRole) {
  const course = await this.enrollmentRepository.findCourseById(courseId)

  if (!course) {
    throw new NotFoundError('Cours introuvable.')
  }
    this.checkPublishedCourse(course)
    this.checkCourseManagement(course, actorId, actorRole)


  const learner = await this.enrollmentRepository.findUserById(learnerId)

  if (!learner) {
    throw new NotFoundError('Utilisateur introuvable.')
  }

  if (learner.role !== 'learner') {
    throw new ConflictError('Seul un apprenant peut s\'inscrire à cette formation.')
  }
  if (!learner.isActive) {
      throw new ForbiddenError('Ce compte utilisateur est désactivé.')
    }

   

  const existingEnrollment =
    await this.enrollmentRepository.findByUserAndCourse(learnerId, courseId)

  if (existingEnrollment) {
    throw new ConflictError('Cet apprenant est déjà inscrit à ce cours.')
  }

  return this.enrollmentRepository.create(learnerId, courseId)
}

  async getMyEnrollments(userId: string){
    return this.enrollmentRepository.findByUser(userId)
  }

}
