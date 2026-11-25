
import { Enrollment } from './enrollment.model.js'
import { LessonProgress } from './lesson-progress.model.js'
import { Course } from '../courses/courses.model.js'
import { User } from '../users/user.model.js'
import { Lesson } from '../lessons/lessons.model.js'
import { Module } from '../modules/modules.model.js'

export class EnrollmentRepository {
  async findCourseById(courseId: string) {
    return Course.findByPk(courseId)
  }

  async findByUserAndCourse(userId: string, courseId: string) {
    return Enrollment.findOne({
      where: { userId, courseId },
    })
  }

  async create(userId: string, courseId: string) {
    return Enrollment.create({ userId, courseId })
  }

  async findByCourse(courseId: string) {
    return Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
        },
      ],
      order: [['createdAt', 'ASC']],
    })
  }

  async findLessonProgress(enrollmentId: string, lessonId: string) {
    return LessonProgress.findOne({
      where: { enrollmentId, lessonId },
    })
  }

  async createLessonProgress(
    enrollmentId: string,
    lessonId: string,
    progress: number,
  ) {
    return LessonProgress.create({
      enrollmentId,
      lessonId,
      progress,
    })
  }

  async updateLessonProgress(
    lessonProgress: LessonProgress,
    progress: number,
  ) {
    lessonProgress.progress = progress

    return lessonProgress.save()
  }
  async findEnrollmentById(enrollmentId: string) {
  return Enrollment.findByPk(enrollmentId)
}

async findLessonById(lessonId: string) {
  return Lesson.findByPk(lessonId)
}

async findModuleById(moduleId: string) {
  return Module.findByPk(moduleId)
}

async findUserById(userId: string) {
  return User.findByPk(userId)
}

async findByUser(userId: string){
  return Enrollment.findAll({
    where:{userId},
    include:[
      {
        model:Course,
        as:'course'
      },
    ],
    order:[['createdAt','DESC']],
  })
}
}
