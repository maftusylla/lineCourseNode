
import {DataTypes,Model,type CreationOptional,type InferAttributes,type InferCreationAttributes,type Sequelize,
} from 'sequelize'

export class Module extends Model<InferAttributes<Module>,InferCreationAttributes<Module>> {
  declare id: CreationOptional<string>
  declare titre: string
  declare description: string
  declare courseId: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>

  static initModel(sequelize: Sequelize): typeof Module {
    Module.init(
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
        courseId: {
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
        tableName: 'modules',
        modelName: 'Module',
        underscored: true,
      },
    )

    return Module
  }
}
