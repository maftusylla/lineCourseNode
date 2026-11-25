
import { Lesson } from './lessons.model.js'

export interface CreateLessonRecord {
  titre: string
  contenu: string
  moduleId: string
}

export interface ListLessonsInput {
  moduleId: string
  page: number
  perPage: number
}

export interface ILessonRepository {
  createLesson(data: CreateLessonRecord): Promise<Lesson>
  findById(id: string): Promise<Lesson | null>
  list(input: ListLessonsInput): Promise<{ rows: Lesson[]; count: number }>
}

export class LessonRepository implements ILessonRepository {
  createLesson(data: CreateLessonRecord): Promise<Lesson> {
    return Lesson.create(data)
  }

  findById(id: string): Promise<Lesson | null> {
    return Lesson.findByPk(id)
  }

  list(input: ListLessonsInput): Promise<{ rows: Lesson[]; count: number }> {
    return Lesson.findAndCountAll({
      where: { moduleId: input.moduleId },
      limit: input.perPage,
      offset: (input.page - 1) * input.perPage,
      order: [['createdAt', 'DESC']],
    })
  }
}
