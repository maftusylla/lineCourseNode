
import type { Request, Response } from 'express'
import { ModuleService } from './modules.service.js'
import { sendSuccess } from '../../shared/api-response.js'

const moduleService = new ModuleService()

function getModuleId(request: Request): string {
  const params = request.validated?.params as { id: string }
  return params.id
}

export class ModuleController {
  static async create(request: Request, response: Response) {
    const courseId = getModuleId(request)

    const body = request.validated!.body as {
      titre: string
      description: string
    }

    const module = await moduleService.create(
      courseId,
      request.auth!.userId,
      request.auth!.role,
      body,
    )

    return sendSuccess(response, module, 201)
  }

static async index(request: Request, response: Response) {
  const query = request.validated?.query as {
    page: number
    per_page: number
  }

  const result = await moduleService.listByCourse({
    courseId: getModuleId(request),
    page: query.page,
    perPage: query.per_page,
    userId: request.auth!.userId,
    role: request.auth!.role,
  })

  return sendSuccess(response, result.modules, 200, result.pagination)
}
}
