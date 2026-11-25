'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('courses',{
      id: { type: Sequelize.UUID, allowNull: false, primaryKey: true },
      titre: { type: Sequelize.STRING(120), allowNull: false },
      description: { type: Sequelize.STRING(1000), allowNull: false },
      status:{type: Sequelize.ENUM('draft','published','archived'),defaultValue:'draft',allowNull:false},
      user_id:{type:Sequelize.UUID,references: { model: 'users', key: 'id' },onUpdate: 'CASCADE', onDelete: 'RESTRICT',},
      created_at:{type: Sequelize.DATE,allowNull:false},
      updated_at:{type:Sequelize.DATE,allowNull:false }
    })
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.dropTable('courses')
  }
};
