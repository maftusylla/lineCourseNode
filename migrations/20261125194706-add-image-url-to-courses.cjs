'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('courses', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
       await queryInterface.removeColumn('courses', 'image_url');

  }
};
