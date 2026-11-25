import { AuthAuditEvent } from '../modules/auth/auth-audit-event.model.js'
import { OneTimeToken } from '../modules/auth/one-time-token.model.js'
import { RefreshToken } from '../modules/auth/refresh-token.model.js'
import { User } from '../modules/users/user.model.js'
import { Course } from '../modules/courses/courses.model.js'
import { Module } from '../modules/modules/modules.model.js'
import { Lesson } from '../modules/lessons/lessons.model.js'
import { Enrollment } from '../modules/enrollment/enrollment.model.js'
import { LessonProgress } from '../modules/enrollment/lesson-progress.model.js'
import { sequelize } from './sequelize.js'

let initialized = false

export function initializeModels(): void {
  if (initialized) return

  User.initModel(sequelize)
  Course.initModel(sequelize)
  Module.initModel(sequelize)
  Lesson.initModel(sequelize)
  Enrollment.initModel(sequelize)
  LessonProgress.initModel(sequelize)
  RefreshToken.initModel(sequelize)
  OneTimeToken.initModel(sequelize)
  AuthAuditEvent.initModel(sequelize)

  User.hasMany(RefreshToken, {
    foreignKey: 'userId',
    as: 'refreshTokens',
    onDelete: 'CASCADE',
  })
  RefreshToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })
  RefreshToken.belongsTo(RefreshToken, {
    foreignKey: 'replacedById',
    as: 'replacement',
  })

  User.hasMany(OneTimeToken, {
    foreignKey: 'userId',
    as: 'oneTimeTokens',
    onDelete: 'CASCADE',
  })
  OneTimeToken.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  User.hasMany(AuthAuditEvent, {
    foreignKey: 'userId',
    as: 'authAuditEvents',
    onDelete: 'SET NULL',
  })
  AuthAuditEvent.belongsTo(User, { foreignKey: 'userId', as: 'user' })

  User.hasMany(Course,{
    foreignKey:'userId',
    as:'courses',
    onDelete:'RESTRICT',
  })
  Course.belongsTo(User,{
    foreignKey:'userId',
    as:'user'
  })
  Course.hasMany(Module,{
      foreignKey:'courseId',
      as:'modules',
      onDelete:'RESTRICT',
  })
  Module.belongsTo(Course,{
    foreignKey:'courseId',
    as:'course',
  }
  )
  Module.hasMany(Lesson,{
    foreignKey:'moduleId',
    as: 'lessons',
    onDelete:'RESTRICT',

  })
  Lesson.belongsTo(Module,{
    foreignKey:'moduleId',
    as:'module',
  })
  User.hasMany(Enrollment, {
  foreignKey: 'userId',
  as: 'enrollments',
  onDelete: 'RESTRICT',
})

Enrollment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'enrollments',
  onDelete: 'RESTRICT',
})

Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course',
})
Enrollment.hasMany(LessonProgress, {
  foreignKey: 'enrollmentId',
  as: 'lessonProgress',
  onDelete: 'CASCADE',
})

LessonProgress.belongsTo(Enrollment, {
  foreignKey: 'enrollmentId',
  as: 'enrollment',
})

Lesson.hasMany(LessonProgress, {
  foreignKey: 'lessonId',
  as: 'progressions',
  onDelete: 'RESTRICT',
})

LessonProgress.belongsTo(Lesson, {
  foreignKey: 'lessonId',
  as: 'lesson',
})

  initialized = true
}

export const Models = { User, RefreshToken, OneTimeToken, AuthAuditEvent ,Course, Module,Lesson,Enrollment,LessonProgress}

  