
import { Module } from './modules.model.js'

export interface CreateModuleRecord {
  titre: string
  description: string
  courseId: string
}

export interface ListModulesInput {
  courseId: string
  page: number
  perPage: number
}

export interface IModuleRepository {
  create(data: CreateModuleRecord): Promise<Module>
  findById(id: string): Promise<Module | null>
  list(input: ListModulesInput): Promise<{ rows: Module[]; count: number }>
}

export class ModuleRepository implements IModuleRepository {
  create(data: CreateModuleRecord): Promise<Module> {
    return Module.create(data)
  }

  findById(id: string): Promise<Module | null> {
    return Module.findByPk(id)
  }

  list(input: ListModulesInput): Promise<{ rows: Module[]; count: number }> {
    return Module.findAndCountAll({
      where: { courseId: input.courseId },
      limit: input.perPage,
      offset: (input.page - 1) * input.perPage,
      order: [['createdAt', 'DESC']],
    })
  }
}
