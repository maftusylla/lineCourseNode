
import {DataTypes,Model,type CreationOptional,type InferAttributes,type InferCreationAttributes,type Sequelize,
} from 'sequelize'

export class Lesson extends Model<InferAttributes<Lesson>,InferCreationAttributes<Lesson>> {
  declare id: CreationOptional<string>
  declare titre: string
  declare contenu: string
  declare moduleId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof Lesson {
    Lesson.init(
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
        contenu: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        moduleId: {
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
      },
      {
        sequelize,
        tableName: 'lessons',
        modelName: 'Lesson',
        underscored: true,
      },
    )

    return Lesson
  }
}
