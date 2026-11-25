
import type { Request, Response } from 'express'
import { LessonService } from './Lessons.service.js'
import { sendSuccess } from '../../shared/api-response.js'

const lessonService = new LessonService()

function getLessonId(request: Request): string {
  const params = request.validated?.params as { moduleId: string }
  return params.moduleId
}

export class LessonController {
  static async create(request: Request, response: Response) {
    const moduleId = getLessonId(request)

    const body = request.validated!.body as {
      titre: string
      contenu: string
    }

    const lesson = await lessonService.create(
      moduleId,
      request.auth!.userId,
      request.auth!.role,
      body,
    )

    return sendSuccess(response, lesson, 201)
  }

static async index(request: Request, response: Response) {
  const query = request.validated?.query as {
    page: number
    per_page: number
  }

  const result = await lessonService.listByModule({
    moduleId: getLessonId(request),
    page: query.page,
    perPage: query.per_page,
    userId: request.auth!.userId,
    role: request.auth!.role,
  })

  return sendSuccess(response, result.lessons, 200, result.pagination)
}
}
