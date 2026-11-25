import {DataTypes, Model,type CreationOptional,type InferAttributes,type InferCreationAttributes,type Sequelize,
} from 'sequelize'

export const COURSE_STATUSES = ['draft', 'published', 'archived'] as const
export type CourseStatus = (typeof COURSE_STATUSES)[number]

export class Course extends Model<InferAttributes<Course>,InferCreationAttributes<Course>
> {
  declare id: CreationOptional<string>
  declare titre: string
  declare description: string
  declare status: CreationOptional<CourseStatus>
  declare userId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  static initModel(sequelize: Sequelize): typeof Course {
    Course.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        titre: {
          type: DataTypes.STRING(120),
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING(1000),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM(...COURSE_STATUSES),
          allowNull: false,
          defaultValue: 'draft',
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        tableName: 'courses',
        modelName: 'Course',
        underscored: true,
        paranoid: true,
      },
    )

    return Course
  }
}
