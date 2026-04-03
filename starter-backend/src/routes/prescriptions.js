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

// Add a prescription to a customer
router.post('/customers/:id/prescriptions', (req, res) => {
  const customerId = req.params.id
  const data = req.body
  const customer = db.getCustomerById(customerId)
  if (!customer) return res.status(404).json({ error: 'Customer not found' })

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
