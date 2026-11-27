import type { Request,Response } from 'express'
import { EnrollmentService } from './enrollment.service.js'
import { sendSuccess } from '../../shared/api-response.js'


const service = new EnrollmentService()

const getCourseId = (request: Request): string => {
  return (request.validated!.params as { courseId: string }).courseId
}

export class EnrollmentController {
  static readonly enroll = async (request: Request, response: Response) => {
    const courseId = getCourseId(request)
    const userId = request.auth!.userId

    const enrollment = await service.enroll(userId, courseId)

   return sendSuccess(response, enrollment, 201)
  }

  static readonly index = async (request: Request, response: Response) => {
    const courseId = getCourseId(request)
    const {userId,role} =request.auth!

    const enrollments = await  service.getEnrollments(courseId,userId,role)

   return sendSuccess(response, enrollments)
  }

  static readonly updateProgress = async (request: Request, response: Response) => {
  const {enrollmentId ,lessonId} = (
    request.validated!.params as {
      enrollmentId: string
      lessonId: string
    }
  )

  const { progress }=request.validated!.body as {
    progress:number
  }
  const result = await service.updateLessonProgress(
    request.auth!.userId,
    enrollmentId,
    lessonId,
    progress,
  )
  return sendSuccess(response,result)
}
static readonly enrollLearner = async (request: Request,response: Response) => {
  const courseId = getCourseId(request)

  const { userId:learnerId} = request.validated!.body as {
    userId: string
  }
  const { userId: actorId, role } = request.auth!

  const enrollment = await service.enrollLearner(
    courseId,
    learnerId,
    actorId,
    role,
  )

 return  sendSuccess(response, enrollment, 201)
}
  static readonly getMyEnrollments=async(request:Request,response:Response)=>{
    const userId =request.auth!.userId
    const enrollments=await service.getMyEnrollments(userId)
  sendSuccess(response, enrollments, 200)

}

}