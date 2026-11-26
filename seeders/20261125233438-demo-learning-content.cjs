
'use strict'

const { randomUUID } = require('crypto')

module.exports = {
  async up(queryInterface) {
    const now = new Date()

    // 1. Récupération des utilisateurs
    const users = await queryInterface.sequelize.query(
      `SELECT id, email FROM users
       WHERE email IN (
         'teacher@cours-alygne.test',
         'teacher2@cours-alygne.test',
         'learner@cours-alygne.test',
         'learner2@cours-alygne.test',
         'learner3@cours-alygne.test',
         'learner4@cours-alygne.test'
       )`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )

    const userId = (email) => {
      const user = users.find((u) => u.email === email)

      if (!user) {
        throw new Error(`Utilisateur introuvable : ${email}`)
      }

      return user.id
    }

    const teacher1 = userId('teacher@cours-alygne.test')
    const teacher2 = userId('teacher2@cours-alygne.test')

    const learner1 = userId('learner@cours-alygne.test')
    const learner2 = userId('learner2@cours-alygne.test')
    const learner3 = userId('learner3@cours-alygne.test')
    const learner4 = userId('learner4@cours-alygne.test')

    // 2. Création des cours
    const courses = [
      {
        id: randomUUID(),
        titre: 'Développement React',
        description: 'Apprenez à créer des interfaces web modernes avec React, les composants et les hooks.',
        status: 'published',
        user_id: teacher1,
        image_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: randomUUID(),
        titre: 'Node.js et Express',
        description: 'Maîtrisez la création d’API REST avec Node.js, Express et les bonnes pratiques backend.',
        status: 'published',
        user_id: teacher1,
        image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: randomUUID(),
        titre: 'Initiation à Python',
        description: 'Découvrez la programmation avec Python : variables, conditions, boucles et fonctions.',
        status: 'published',
        user_id: teacher2,
        image_url: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: randomUUID(),
        titre: 'Bases de données MySQL',
        description: 'Apprenez à concevoir des bases de données relationnelles et à écrire des requêtes SQL.',
        status: 'draft',
        user_id: teacher2,
        image_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: randomUUID(),
        titre: 'Cybersécurité',
        description: 'Découvrez les principes fondamentaux de la sécurité informatique et de la protection des données.',
        status: 'archived',
        user_id: teacher1,
        image_url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        id: randomUUID(),
        titre: 'Développement Vue.js',
        description: 'Découvrez Vue.js et apprenez à construire des applications frontend réactives.',
        status: 'draft',
        user_id: teacher2,
        image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200',
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ]

    await queryInterface.bulkInsert('courses', courses)

    // 3. Création des modules
    const modules = []
    const moduleIds = {}

    const moduleDefinitions = [
      {
        course: 0,
        items: [
          ['Introduction à React', 'Découvrez React et son fonctionnement.'],
          ['Composants et props', 'Organisez votre application avec les composants.'],
          ['Les hooks', 'Utilisez useState et useEffect.'],
        ],
      },
      {
        course: 1,
        items: [
          ['Introduction à Node.js', 'Comprenez le fonctionnement de Node.js.'],
          ['Créer une API avec Express', 'Construisez vos premières routes API.'],
          ['Gestion des erreurs', 'Gérez les erreurs dans une API.'],
        ],
      },
      {
        course: 2,
        items: [
          ['Découvrir Python', 'Installez Python et découvrez sa syntaxe.'],
          ['Conditions et boucles', 'Utilisez les structures de contrôle.'],
          ['Fonctions Python', 'Créez et utilisez des fonctions.'],
        ],
      },
      {
        course: 3,
        items: [
          ['Modélisation des données', 'Découvrez les tables et les relations.'],
          ['Les requêtes SQL', 'Apprenez les requêtes SELECT, INSERT et UPDATE.'],
        ],
      },
      {
        course: 4,
        items: [
          ['Introduction à la cybersécurité', 'Découvrez les notions de base.'],
          ['Les menaces informatiques', 'Identifiez les principales menaces.'],
        ],
      },
      {
        course: 5,
        items: [
          ['Introduction à Vue.js', 'Découvrez les concepts de Vue.js.'],
          ['Composants Vue', 'Créez des composants réutilisables.'],
        ],
      },
    ]

    for (const definition of moduleDefinitions) {
      const course = courses[definition.course]

      for (const [index, item] of definition.items.entries()) {
        const id = randomUUID()

        moduleIds[`${definition.course}-${index}`] = id

        modules.push({
          id,
          titre: item[0],
          description: item[1],
          course_id: course.id,
          created_at: now,
          updated_at: now,
        })
      }
    }

    await queryInterface.bulkInsert('modules', modules)

    // 4. Création des leçons
    const lessons = []
    const lessonIds = {}

    const lessonDefinitions = [
      {
        module: '0-0',
        items: [
          ['Qu’est-ce que React ?', 'Présentation de React et de ses avantages.'],
          ['Installation de React', 'Création d’un premier projet React.'],
        ],
      },
      {
        module: '0-1',
        items: [
          ['Créer un composant', 'Définir et afficher un composant React.'],
          ['Comprendre les props', 'Transmettre des données entre composants.'],
        ],
      },
      {
        module: '0-2',
        items: [
          ['Découvrir useState', 'Gérer les états dans un composant.'],
          ['Découvrir useEffect', 'Exécuter des effets dans un composant.'],
        ],
      },
      {
        module: '1-0',
        items: [
          ['Présentation de Node.js', 'Comprendre Node.js et son environnement.'],
          ['Modules et imports', 'Organiser le code avec les modules JavaScript.'],
        ],
      },
      {
        module: '1-1',
        items: [
          ['Première route Express', 'Créer une route GET.'],
          ['Créer une API REST', 'Construire des routes CRUD.'],
        ],
      },
      {
        module: '1-2',
        items: [
          ['Middleware de gestion des erreurs', 'Centraliser la gestion des erreurs.'],
          ['Validation des données', 'Valider les données reçues par une API.'],
        ],
      },
      {
        module: '2-0',
        items: [
          ['Installer Python', 'Préparer son environnement Python.'],
          ['Variables et types', 'Manipuler les variables et les types de données.'],
        ],
      },
      {
        module: '2-1',
        items: [
          ['Les conditions', 'Utiliser if, elif et else.'],
          ['Les boucles', 'Utiliser for et while.'],
        ],
      },
      {
        module: '2-2',
        items: [
          ['Déclarer une fonction', 'Créer une fonction Python.'],
          ['Paramètres et retour', 'Utiliser les paramètres et return.'],
        ],
      },
      {
        module: '3-0',
        items: [
          ['Créer une table', 'Comprendre la structure d’une table.'],
          ['Les clés étrangères', 'Relier plusieurs tables.'],
        ],
      },
      {
        module: '3-1',
        items: [
          ['SELECT et WHERE', 'Lire et filtrer des données.'],
          ['INSERT et UPDATE', 'Ajouter et modifier des données.'],
        ],
      },
      {
        module: '4-0',
        items: [
          ['Les principes de sécurité', 'Découvrir confidentialité, intégrité et disponibilité.'],
          ['Les bonnes pratiques', 'Adopter les premiers réflexes de sécurité.'],
        ],
      },
      {
        module: '4-1',
        items: [
          ['Les logiciels malveillants', 'Découvrir les différentes familles de menaces.'],
          ['Le phishing', 'Comprendre les attaques par hameçonnage.'],
        ],
      },
      {
        module: '5-0',
        items: [
          ['Découvrir Vue.js', 'Comprendre les bases du framework.'],
          ['Créer un projet Vue', 'Initialiser une application Vue.js.'],
        ],
      },
      {
        module: '5-1',
        items: [
          ['Les composants', 'Créer des composants Vue.'],
          ['Les propriétés', 'Transmettre des données avec les props.'],
        ],
      },
    ]

    for (const definition of lessonDefinitions) {
      const moduleId = moduleIds[definition.module]

      for (const [index, item] of definition.items.entries()) {
        const id = randomUUID()

        lessonIds[`${definition.module}-${index}`] = id

        lessons.push({
          id,
          titre: item[0],
          contenu: `<h2>${item[0]}</h2><p>${item[1]}</p><p>Cette leçon présente les notions essentielles à connaître et propose des exemples pratiques pour faciliter l’apprentissage.</p>`,
          module_id: moduleId,
          created_at: now,
          updated_at: now,
        })
      }
    }

    await queryInterface.bulkInsert('lessons', lessons)

    // 5. Inscriptions des apprenants
    const enrollmentDefinitions = [
      { learner: learner1, course: 0 },
      { learner: learner1, course: 1 },
      { learner: learner1, course: 2 },
      { learner: learner2, course: 0 },
      { learner: learner2, course: 2 },
      { learner: learner3, course: 1 },
      { learner3: learner3, course: 2 },
      { learner: learner4, course: 0 },
    ]

    const enrollments = enrollmentDefinitions.map((item) => ({
      id: randomUUID(),
      user_id: item.learner,
      course_id: courses[item.course].id,
      created_at: now,
      updated_at: now,
    }))

    await queryInterface.bulkInsert('enrollments', enrollments)

    // 6. Progression des apprenants
    const progressDefinitions = [
      // Apprenant 1 : progression avancée sur React
      { enrollment: 0, lesson: '0-0-0', progress: 100 },
      { enrollment: 0, lesson: '0-0-1', progress: 100 },
      { enrollment: 0, lesson: '0-1-0', progress: 100 },
      { enrollment: 0, lesson: '0-1-1', progress: 60 },

      // Apprenant 1 : progression partielle sur Node.js
      { enrollment: 1, lesson: '1-0-0', progress: 100 },
      { enrollment: 1, lesson: '1-0-1', progress: 40 },

      // Apprenant 1 : début de Python
      { enrollment: 2, lesson: '2-0-0', progress: 30 },

      // Apprenant 2 : React commencé
      { enrollment: 3, lesson: '0-0-0', progress: 100 },
      { enrollment: 3, lesson: '0-0-1', progress: 50 },

      // Apprenant 2 : Python terminé
      { enrollment: 4, lesson: '2-0-0', progress: 100 },
      { enrollment: 4, lesson: '2-0-1', progress: 100 },
      { enrollment: 4, lesson: '2-1-0', progress: 100 },
      { enrollment: 4, lesson: '2-1-1', progress: 100 },

      // Apprenant 3 : Node.js commencé
      { enrollment: 5, lesson: '1-0-0', progress: 20 },

      // Apprenant 3 : Python commencé
      { enrollment: 6, lesson: '2-0-0', progress: 100 },
      { enrollment: 6, lesson: '2-0-1', progress: 100 },
      { enrollment: 6, lesson: '2-1-0', progress: 50 },

      // Apprenant 4 : React commencé
      { enrollment: 7, lesson: '0-0-0', progress: 50 },
    ]

    const lessonProgress = progressDefinitions.map((item) => ({
      id: randomUUID(),
      enrollment_id: enrollments[item.enrollment].id,
      lesson_id: lessonIds[item.lesson],
      progress: item.progress,
      created_at: now,
      updated_at: now,
    }))

    await queryInterface.bulkInsert('lesson_progress', lessonProgress)
  },

  async down(queryInterface) {
    // Suppression dans l'ordre des dépendances
    await queryInterface.bulkDelete('lesson_progress', null, {})
    await queryInterface.bulkDelete('enrollments', null, {})
    await queryInterface.bulkDelete('lessons', null, {})
    await queryInterface.bulkDelete('modules', null, {})
    await queryInterface.bulkDelete('courses', null, {})
  },
}
