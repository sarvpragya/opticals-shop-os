// Simple integration test for prescriptions endpoints
const base = process.env.BASE || 'http://localhost:3001'

async function request(path, opts = {}) {
  const res = await fetch(base + path, opts)
  const text = await res.text()
  let body = null
  try { body = JSON.parse(text) } catch (e) { body = text }
  return { status: res.status, body }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function main() {
  console.log('Running backend integration tests against', base)

  // Wait for backend
  for (let i=0;i<20;i++){
    try { const r = await fetch(base + '/'); if (r.ok) break } catch(e) { await new Promise(r=>setTimeout(r,500)) }
  }

  // Login
  let r = await request('/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username: 'admin', password: 'admin123' }) })
  assert(r.status === 200 && r.body && r.body.token, 'Login failed: ' + JSON.stringify(r))
  const token = r.body.token
  console.log('Login OK')

  // Create customer
  r = await request('/customers', { method: 'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ name: 'TestUser', dob:'1990-01-01' }) })
  assert(r.status === 201 && r.body && r.body.id, 'Create customer failed')
  const customerId = r.body.id
  console.log('Customer created', customerId)

  // Add prescription
  const presPayload = { provider:'TestDr', pd:'63', od:{sphere:'-1.00', cyl:'-0.50', axis:'90'}, os:{sphere:'-0.75', cyl:'-0.25', axis:'80'}, notes:'auto-test' }
  r = await request(`/customers/${customerId}/prescriptions`, { method: 'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify(presPayload) })
  assert(r.status === 201 && r.body && r.body.id, 'Add prescription failed: ' + JSON.stringify(r))
  const presId = r.body.id
  console.log('Prescription created', presId)

  // List prescriptions
  r = await request(`/customers/${customerId}/prescriptions`, { headers: { 'Authorization':'Bearer '+token } })
  assert(r.status === 200 && Array.isArray(r.body), 'List prescriptions failed')
  assert(r.body.length >= 1, 'No prescriptions returned')
  console.log('Prescriptions listed, count=', r.body.length)

  console.log('All tests passed')
}

main().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(2) })
