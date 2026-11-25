import type { Request,Response } from 'express'
import { EnrollmentService } from './enrollment.service.js'
import { sendSuccess } from '../../shared/api-response.js'

const getCourseId = (request: Request): string => {
  return (request.validated!.params as { courseId: string }).courseId
}

export class EnrollmentController {
  static readonly enroll = async (request: Request, response: Response) => {
    const courseId = getCourseId(request)
    const userId = request.auth!.userId

    const enrollment = await new EnrollmentService().enroll(userId, courseId)

    sendSuccess(response, enrollment, 201)
  }

  static readonly index = async (request: Request, response: Response) => {
    const courseId = getCourseId(request)

    const enrollments = await new EnrollmentService().getEnrollments(courseId)

    sendSuccess(response, enrollments)
  }

  static readonly updateProgress = async (request: Request, response: Response) => {
  const enrollmentId = (
    request.validated!.params as {
      enrollmentId: string
      lessonId: string
    }
  ).enrollmentId

  const lessonId = (
    request.validated!.params as {
      enrollmentId: string
      lessonId: string
    }
  ).lessonId

  const userId = request.auth!.userId

  const { progress } = request.validated!.body as {
    progress: number
  }

  const result = await new EnrollmentService().updateLessonProgress(
    userId,
    enrollmentId,
    lessonId,
    progress,
  )

  sendSuccess(response, result)
}
static readonly enrollLearner = async (request: Request,response: Response) => {
  const courseId = getCourseId(request)

  const { userId } = request.validated!.body as {
    userId: string
  }

  const enrollment = await new EnrollmentService().enrollLearner(
    courseId,
    userId,
  )

  sendSuccess(response, enrollment, 201)
}
  static readonly getMyEnrollments=async(request:Request,response:Response)=>{
    const userId =request.auth!.userId
    const enrollments=await new EnrollmentService().getMyEnrollments(userId)
  sendSuccess(response, enrollments, 201)

}


}