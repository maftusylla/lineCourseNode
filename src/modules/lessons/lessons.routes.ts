import { Router } from 'express'
import { LessonController } from './lessons.controller.js'
import {
  createLessonSchema,
  moduleIdSchema,
  listLessonsSchema,
} from './lessons.schema.js'
import { authorize,requireVerifiedEmail,authenticate } from '../../middlewares/authenticate.js'
import { validateBody, validateParams, validateQuery } from '../../middlewares/validate.js'
import { asyncHandler } from '../../shared/async-handler.js'

const router = Router()

router.post(
  '/courses/modules/:moduleId/lessons',
  authenticate,
  requireVerifiedEmail,
  authorize('admin', 'teacher'),
  validateParams(moduleIdSchema),
  validateBody(createLessonSchema),
  asyncHandler(LessonController.create),
)

router.get(
  '/courses/modules/:moduleId/lessons',
  authenticate,
  validateParams(moduleIdSchema),
  validateQuery(listLessonsSchema),
  asyncHandler(LessonController.index),
)

export default router