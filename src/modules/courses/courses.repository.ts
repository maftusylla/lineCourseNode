
import type { UserRole } from '../users/user.model.js'
import { Course } from './courses.model.js'
import { Module } from '../modules/modules.model.js'
import { Lesson } from '../lessons/lessons.model.js'

import { Op, type WhereOptions } from 'sequelize'

export interface CreateCoursesRecord {
  titre: string
  description: string
  imageUrl?:string | null
  userId: string
}

export interface UpdateCourseRecord {
  titre?: string
  description?: string
  imageUrl?:string | null


}

export interface ListCoursesInput {
  page: number
  perPage: number
  role?: UserRole
  userId?: string
}

export interface ICourseRepository {
  findById(id: string): Promise<Course | null>
  create(data: CreateCoursesRecord): Promise<Course>
  update(course: Course, data: UpdateCourseRecord): Promise<Course>
  softDelete(course: Course): Promise<void>
  publish(course: Course): Promise<Course>
  list(input: ListCoursesInput): Promise<{ rows: Course[]; count: number }>
  findPublishedById(id: string): Promise<Course | null>
}

export class CourseRepository implements ICourseRepository {
  findById(id: string): Promise<Course | null> {
    return Course.findByPk(id)
  }

  create(data: CreateCoursesRecord): Promise<Course> {
    return Course.create(data)
  }

  update(course: Course, data: UpdateCourseRecord): Promise<Course> {
    return course.update(data)
  }

  async softDelete(course: Course): Promise<void> {
    await course.destroy()
  }

  publish(course: Course): Promise<Course> {
    return course.update({ status: 'published' })
  }

  async list(input: ListCoursesInput): Promise<{ rows: Course[]; count: number }> {
    let where: WhereOptions = {status:'published'}

    if (input.role === 'admin') {
      where = {}
  }

    if (input.role === 'teacher') {
      where = {
        [Op.or]: [
          { status: 'published' },
          { userId: input.userId },
        ],
      }
    }

    return Course.findAndCountAll({
      where,
      limit: input.perPage,
      offset: (input.page - 1) * input.perPage,
      order: [['createdAt', 'DESC']],
      include: [
      {
        model: Module,
        as: 'modules',
        include: [
          {
            model: Lesson,
            as: 'lessons',
          },
        ],
      },
    ],
    distinct: true,
    })
  }
async findPublishedById(id: string): Promise<Course | null> {
  return Course.findOne({
    where: {
      id,
      status: 'published',
    },
    include: [
      {
        model: Module,
        as: 'modules',
        include: [
          {
            model: Lesson,
            as: 'lessons',
          },
        ],
      },
    ],
  })
}
}
