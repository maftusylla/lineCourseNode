import { Router } from 'express'
import { ModuleController } from './modules.controller.js'
import {createModuleSchema,courseModuleIdSchema,listModulesSchema,
} from './modules.schema.js'
import { authorize,requireVerifiedEmail,authenticate } from '../../middlewares/authenticate.js'
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js'
import { asyncHandler } from '../../shared/async-handler.js'

const router = Router()

router.post(
  '/courses/:id/modules',
  authenticate,
  requireVerifiedEmail,
  authorize('admin', 'teacher'),
  validateParams(courseModuleIdSchema),
  validateBody(createModuleSchema),
  asyncHandler(ModuleController.create),
)

router.get(
   '/courses/:id/modules',
  authenticate,
  validateParams(courseModuleIdSchema),
  validateQuery(listModulesSchema),
  asyncHandler(ModuleController.index),
)
export default router