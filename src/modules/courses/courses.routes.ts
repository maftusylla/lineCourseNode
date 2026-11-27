
import { Router } from 'express'
import {authenticate,authorize,requireVerifiedEmail} from '../../middlewares/authenticate.js'
import {validateQuery,validateBody,validateParams} from '../../middlewares/validate.js'
import { asyncHandler } from '../../shared/async-handler.js'
import { CourseController } from './courses.controller.js'
import {createCourseSchema,listCoursesSchema,updateCourseSchema,courseIdSchema,} from './courses.schema.js'

export const coursesRouter = Router()

coursesRouter.get(
  '/public',
  validateQuery(listCoursesSchema),
  asyncHandler(CourseController.publicIndex),
)
coursesRouter.get(
  '/public/:id',
  validateParams(courseIdSchema),
  asyncHandler(CourseController.publicShow),
)
coursesRouter.use(authenticate, requireVerifiedEmail)

coursesRouter.get(
  '/',
  validateQuery(listCoursesSchema),
  asyncHandler(CourseController.index),
)

coursesRouter.post(
  '/',
  authorize('admin', 'teacher'),
  validateBody(createCourseSchema),
  asyncHandler(CourseController.create),
)

coursesRouter.get(
  '/:id',
  validateParams(courseIdSchema),
  asyncHandler(CourseController.show),
)

coursesRouter.patch(
  '/:id',
  authorize('admin', 'teacher'),
  validateParams(courseIdSchema),
  validateBody(updateCourseSchema),
  asyncHandler(CourseController.update),
)

coursesRouter.delete(
  '/:id',
  authorize('admin', 'teacher'),
  validateParams(courseIdSchema),
  asyncHandler(CourseController.destroy),
)

coursesRouter.patch(
  '/:id/publish',
  authorize('admin', 'teacher'),
  validateParams(courseIdSchema),
  asyncHandler(CourseController.publish),
)
