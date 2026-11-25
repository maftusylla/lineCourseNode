
import {
  DataTypes,
  Model,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type Sequelize,
} from 'sequelize'

export class LessonProgress extends Model<
  InferAttributes<LessonProgress>,
  InferCreationAttributes<LessonProgress>
> {
  declare id: CreationOptional<string>
  declare enrollmentId: string
  declare lessonId: string
  declare progress: number
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof LessonProgress {
    LessonProgress.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        enrollmentId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        lessonId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        progress: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
          validate: {
            min: 0,
            max: 100,
          },
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'lesson_progress',
        modelName: 'LessonProgress',
        underscored: true,
        indexes: [
          {
            unique: true,
            fields: ['enrollment_id', 'lesson_id'],
            name: 'lesson_progress_enrollment_lesson_uq',
          },
        ],
      },
    )

    return LessonProgress
  }
}
