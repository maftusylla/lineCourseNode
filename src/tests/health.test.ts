import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from '../app.js'

describe('socle HTTP', () => {
  it('répond sur la route de santé', async () => {
    const response = await request(app).get('/api/health').expect(200)
    expect(response.body.success).toBe(true)
    expect(response.body.data.status).toBe('ok')
    expect(response.headers['x-request-id']).toBeTruthy()
  })

  it('conserve un x-request-id UUID valide', async () => {
    const requestId = '927d26c0-c408-4d9e-90d3-459b5d0ea790'
    const response = await request(app)
      .get('/api/health')
      .set('x-request-id', requestId)
      .expect(200)

    expect(response.headers['x-request-id']).toBe(requestId)
  })

  it('remplace un x-request-id non UUID', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('x-request-id', 'valeur-libre-invalide')
      .expect(200)

    expect(response.headers['x-request-id']).not.toBe('valeur-libre-invalide')
    expect(response.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    )
  })

  it('retourne le format d’erreur commun pour une route inconnue', async () => {
    const response = await request(app).get('/api/inconnue').expect(404)
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'NOT_FOUND' },
    })
    expect(response.body.request_id).toBeTruthy()
  })

  it('retourne une validation normalisée avant d’appeler la base', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: '', email: 'invalide', password: 'x' })
      .expect(400)

    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'VALIDATION_ERROR' },
    })
  })

  it('refuse un JSON mal formé sans exposer une erreur interne', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .set('content-type', 'application/json')
      .send('{"email":')
      .expect(400)

    expect(response.body.error.code).toBe('VALIDATION_ERROR')
    expect(response.body.request_id).toBeTruthy()
  })

  it('protège les routes des cours sans jeton', async () => {
    await request(app).get('/api/courses').expect(401)
  })

  it('protège les routes des modules sans jeton', async () => {
    await request(app)
      .get('/api/courses/927d26c0-c408-4d9e-90d3-459b5d0ea790/modules')
      .expect(401)
  })

  it('protège les routes des leçons sans jeton', async () => {
    await request(app)
      .get('/api/courses/modules/927d26c0-c408-4d9e-90d3-459b5d0ea790/lessons')
      .expect(401)
  })

  it('protège l’inscription automatique sans jeton', async () => {
    await request(app)
      .post('/api/courses/927d26c0-c408-4d9e-90d3-459b5d0ea790/enroll')
      .expect(401)
  })

  it('protège la liste des inscriptions sans jeton', async () => {
    await request(app)
      .get('/api/courses/927d26c0-c408-4d9e-90d3-459b5d0ea790/enrollments')
      .expect(401)
  })

  it('protège la modification de progression sans jeton', async () => {
    await request(app)
      .put('/api/enrollments/927d26c0-c408-4d9e-90d3-459b5d0ea790/lessons/927d26c0-c408-4d9e-90d3-459b5d0ea790/progress')
      .send({ progress: 50 })
      .expect(401)
  })

  it('protège l’inscription administrative sans jeton', async () => {
    await request(app)
      .post('/api/courses/927d26c0-c408-4d9e-90d3-459b5d0ea790/enrollments')
      .send({ userId: '927d26c0-c408-4d9e-90d3-459b5d0ea790' })
      .expect(401)
  })
})
