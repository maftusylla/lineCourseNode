import type { Request, Response } from 'express'
import { sendSuccess } from '../../shared/api-response.js'
import { CourseService } from './courses.services.js'

const service = new CourseService()

function getCourseId(request: Request): string {
  const params = request.validated?.params as { id: string }
  return params.id
}


export const CourseController = {
  async create(request: Request, response: Response) {
    const input = request.validated?.body as {
      titre: string
      description: string
      imageUrl?:string | null
    }

    const course = await service.create(request.auth!.userId, input)

    return sendSuccess(response, course, 201)
  },

  async index(request: Request, response: Response) {
    const query = request.validated?.query as {
      page: number
      per_page: number
    }

    const result = await service.list({
      page: query.page,
      perPage: query.per_page,
      role: request.auth!.role,
      userId: request.auth!.userId,
    })

    return sendSuccess(response, result.courses, 200, result.pagination)
  },

  async show(request: Request, response: Response) {
    const course = await service.getById(
      getCourseId(request),
      request.auth!.userId,
      request.auth!.role,
    )

    return sendSuccess(response, course)
  },

  async update(request: Request, response: Response) {
    const input = request.validated?.body as {
      titre?: string
      description?: string
      imageUrl?:string | null
    }

    const course = await service.update(
      getCourseId(request),
      request.auth!.userId,
      request.auth!.role,
      input,
    )

    return sendSuccess(response, course)
  },

  async destroy(request: Request, response: Response) {
    const result = await service.softDelete(
      getCourseId(request),
      request.auth!.userId,
      request.auth!.role,
    )

    return sendSuccess(response, result)
  },

  async publish(request: Request, response: Response) {
    const course = await service.publish(
      getCourseId(request),
      request.auth!.userId,
      request.auth!.role,
    )

    return sendSuccess(response, course)
  },
  async publicIndex(request: Request,response: Response) {
  const query =request.validated?.query as {
    page:number
    per_page:number
  }
  

  const result = await service.list({
    page: query.page,
    perPage: query.per_page,
  })
    return sendSuccess(response, result.courses, 200, result.pagination)
  
},
async publicShow(request: Request, response: Response) {
  const course = await service.getPublicById(getCourseId(request))

  return sendSuccess(response, course)
},
}
