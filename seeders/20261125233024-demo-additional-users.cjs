
'use strict'

const { randomUUID } = require('crypto')
const bcrypt = require('bcryptjs')

module.exports = {
 
async up(queryInterface) {
  const now = new Date()
  const passwordHash = await bcrypt.hash('Password123!', 12)

  const existingUsers = await queryInterface.sequelize.query(
    `SELECT email FROM users WHERE email IN (
      'teacher2@cours-alygne.test',
      'learner2@cours-alygne.test',
      'learner3@cours-alygne.test',
      'learner4@cours-alygne.test'
    )`,
    { type: queryInterface.sequelize.QueryTypes.SELECT }
  )

  const existingEmails = existingUsers.map(user => user.email)

  const users = [
    {
      name: 'Aminata Diallo',
      email: 'teacher2@cours-alygne.test',
      role: 'teacher',
    },
    {
      name: 'Moussa Ndiaye',
      email: 'learner2@cours-alygne.test',
      role: 'learner',
    },
    {
      name: 'Fatou Diop',
      email: 'learner3@cours-alygne.test',
      role: 'learner',
    },
    {
      name: 'Ibrahima Fall',
      email: 'learner4@cours-alygne.test',
      role: 'learner',
    },
  ]

  const usersToInsert = users
    .filter(user => !existingEmails.includes(user.email))
    .map(user => ({
      id: randomUUID(),
      ...user,
      password_hash: passwordHash,
      is_active: true,
      email_verified_at: now,
      auth_version: 0,
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: null,
      password_changed_at: now,
      created_at: now,
      updated_at: now,
    }))

  if (usersToInsert.length > 0) {
    await queryInterface.bulkInsert('users', usersToInsert)
  }
},


  async down(queryInterface) {
    await queryInterface.bulkDelete('users', {
      email: [
        'teacher2@cours-alygne.test',
        'learner2@cours-alygne.test',
        'learner3@cours-alygne.test',
        'learner4@cours-alygne.test',
      ],
    })
  },
}
