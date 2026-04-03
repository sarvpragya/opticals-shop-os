const express = require('express')
const router = express.Router()
const db = require('../db')

// List prescriptions for a customer
router.get('/customers/:id/prescriptions', (req, res) => {
  const customerId = req.params.id
  const customer = db.getCustomerById(customerId)
  if (!customer) return res.status(404).json({ error: 'Customer not found' })
  const prescriptions = customer.prescriptions || []
  res.json(prescriptions)
})

// Add a prescription to a customer with validation
router.post('/customers/:id/prescriptions', (req, res) => {
  const customerId = req.params.id
  const data = req.body || {}
  const customer = db.getCustomerById(customerId)
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

  // Basic validation
  const errors = []
  if (!data.provider || String(data.provider).trim().length === 0) {
    errors.push('provider is required')
  }
  // PD should be numeric if provided
  if (data.pd !== undefined && data.pd !== null && String(data.pd).trim() !== '') {
    const pd = Number(data.pd)
    if (Number.isNaN(pd) || pd <= 0 || pd > 100) errors.push('pd must be a positive number (e.g. 62)')
  }

  function checkEye(prefix, eye) {
    if (!eye) return
    const s = eye.sphere
    const c = eye.cyl
    const a = eye.axis
    if (s !== undefined && s !== null && String(s).trim() !== '') {
      const vs = Number(s)
      if (Number.isNaN(vs) || vs < -30 || vs > 30) errors.push(prefix + '.sphere must be a number between -30 and 30')
    }
    if (c !== undefined && c !== null && String(c).trim() !== '') {
      const vc = Number(c)
      if (Number.isNaN(vc) || vc < -20 || vc > 20) errors.push(prefix + '.cyl must be a number between -20 and 20')
    }
    if (a !== undefined && a !== null && String(a).trim() !== '') {
      const va = Number(a)
      if (!Number.isInteger(va) || va < 0 || va > 180) errors.push(prefix + '.axis must be an integer between 0 and 180')
    }
  }

  checkEye('od', data.od)
  checkEye('os', data.os)

  if (errors.length) return res.status(400).json({ errors })

  const prescription = {
    id: db.generateId(),
    createdAt: new Date().toISOString(),
    provider: data.provider || 'unknown',
    notes: data.notes || '',
    od: data.od || {},
    os: data.os || {},
    pd: data.pd || null,
    type: data.type || 'single',
  }

  db.addPrescriptionToCustomer(customerId, prescription)
  res.status(201).json(prescription)
})

module.exports = router
