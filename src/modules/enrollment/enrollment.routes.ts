
import { Router } from 'express'
import { EnrollmentController } from './enrollment.controller.js'
import { enrollmentCourseIdSchema, enrollLearnerBodySchema, updateLessonProgressParamsSchema, updateLessonProgressBodySchema} from './enrollment.schema.js'
import {authenticate,authorize,requireVerifiedEmail} from '../../middlewares/authenticate.js'
import { validateParams,validateBody } from '../../middlewares/validate.js'
import { asyncHandler } from '../../shared/async-handler.js'
import { verifyEmailSchema } from '../auth/auth.schema.js'

const router = Router()

router.post(
  '/courses/:courseId/enroll',
  authenticate,
  authorize('learner'),
  validateParams(enrollmentCourseIdSchema),
  asyncHandler(EnrollmentController.enroll),
)

router.get(
  '/courses/:courseId/enrollments',
  authenticate,
  authorize('admin', 'teacher'),
  validateParams(enrollmentCourseIdSchema),
  asyncHandler(EnrollmentController.index),
)
router.put(
  '/enrollments/:enrollmentId/lessons/:lessonId/progress',
  authenticate,
  authorize('learner'),
  validateParams(updateLessonProgressParamsSchema),
  validateBody(updateLessonProgressBodySchema),
  asyncHandler(EnrollmentController.updateProgress),
)
router.post(
  '/courses/:courseId/enrollments',
  authenticate,
  authorize('admin', 'teacher'),
  validateParams(enrollmentCourseIdSchema),
  validateBody(enrollLearnerBodySchema),
  asyncHandler(EnrollmentController.enrollLearner),
)
router.get(
  '/enrollments/me',
  authenticate,
  authorize('learner'),
  asyncHandler(EnrollmentController.getMyEnrollments)

)

export default router
