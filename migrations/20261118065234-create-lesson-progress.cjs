
'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('lesson_progress', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
      },
      enrollment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'enrollments',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      lesson_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'lessons',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      progress: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    })

    await queryInterface.addIndex(
      'lesson_progress',
      ['enrollment_id', 'lesson_id'],
      {
        unique: true,
        name: 'lesson_progress_enrollment_lesson_uq',
      },
    )
  },

  async down(queryInterface) {
    await queryInterface.dropTable('lesson_progress')
  },
}
