const express = require('express')
const path = require('path')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const customerRoutes = require('./routes/customers')
const prescriptionsRoutes = require('./routes/prescriptions')

function createApp(opts = {}) {
  const JWT_SECRET = opts.JWT_SECRET || process.env.JWT_SECRET || 'change-this-secret'
  const app = express()
  app.use(cors())
  app.use(express.json())

  // serve uploaded files (if any)
  const uploadsDir = path.join(process.cwd(), 'starter-backend', 'data', 'uploads')
  try {
    const fs = require('fs')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
    app.use('/uploads', express.static(uploadsDir))
  } catch (e) {
    // ignore in environments without filesystem access
  }

  app.get('/', (req, res) => res.json({ status: 'ok', version: '0.1.0' }))

  app.use('/auth', authRoutes({ JWT_SECRET }))
  app.use('/customers', customerRoutes({ JWT_SECRET }))
  app.use('/', prescriptionsRoutes)

  return app
}

module.exports = { createApp }
