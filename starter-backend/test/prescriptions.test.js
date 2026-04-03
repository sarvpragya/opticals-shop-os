const request = require('supertest')
const path = require('path')
const fs = require('fs')

// use a fresh data file per test run
const TEST_DB = path.join(__dirname, '..', 'data', 'data.test.json')
if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB)
process.env.DATA_FILE = TEST_DB

const { createApp } = require('../src/app')
const db = require('../src/db')
const bcrypt = require('bcryptjs')

describe('Prescriptions API', () => {
  let app
  beforeAll(() => {
    // ensure a fresh DB and admin user
    db.ensureDataFile()
    const existing = db.findUserByUsername && db.findUserByUsername('admin')
    if (!existing) {
      const passwordHash = bcrypt.hashSync('admin123', 8)
      db.addUser({ id: 'user-admin', username: 'admin', passwordHash, role: 'admin' })
    }
    app = createApp({ JWT_SECRET: 'test-secret' })
  })

  test('integration: login, create customer, add and list prescription', async () => {
    // login
    const loginRes = await request(app).post('/auth/login').send({ username: 'admin', password: 'admin123' })
    expect(loginRes.status).toBe(200)
    expect(loginRes.body.token).toBeDefined()
    const token = loginRes.body.token

    // create customer
    const custRes = await request(app).post('/customers').set('Authorization', 'Bearer ' + token).send({ name: 'TestUser', dob: '1990-01-01' })
    expect(custRes.status).toBe(201)
    const customerId = custRes.body.id

    // add prescription
    const presPayload = { provider:'TestDr', pd:'63', od:{sphere:'-1.00', cyl:'-0.50', axis:'90'}, os:{sphere:'-0.75', cyl:'-0.25', axis:'80'}, notes:'auto-test' }
    const presRes = await request(app).post(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token).send(presPayload)
    expect(presRes.status).toBe(201)
    expect(presRes.body.id).toBeDefined()

    // list prescriptions
    const listRes = await request(app).get(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token)
    expect(listRes.status).toBe(200)
    expect(Array.isArray(listRes.body)).toBe(true)
    expect(listRes.body.length).toBeGreaterThanOrEqual(1)
  })

  test('validation rejects invalid prescriptions', async () => {
    const loginRes = await request(app).post('/auth/login').send({ username: 'admin', password: 'admin123' })
    const token = loginRes.body.token
    const custRes = await request(app).post('/customers').set('Authorization', 'Bearer ' + token).send({ name: 'InvalidTest' })
    const customerId = custRes.body.id

    // missing provider
    const r1 = await request(app).post(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token).send({ pd:'62', od:{ sphere:'-1.00' } })
    expect(r1.status).toBe(400)
    expect(r1.body.errors.some(e => e.includes('provider'))).toBe(true)

    // invalid pd
    const r2 = await request(app).post(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token).send({ provider:'Dr X', pd:'abc' })
    expect(r2.status).toBe(400)
    expect(r2.body.errors.some(e => e.includes('pd'))).toBe(true)

    // invalid axis
    const r3 = await request(app).post(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token).send({ provider:'Dr X', od:{ axis:999 } })
    expect(r3.status).toBe(400)

    // invalid sphere
    const r4 = await request(app).post(`/customers/${customerId}/prescriptions`).set('Authorization', 'Bearer ' + token).send({ provider:'Dr X', od:{ sphere:999 } })
    expect(r4.status).toBe(400)
  })
})
