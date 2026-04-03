// Test invalid prescription inputs assert server-side validation (expect 400)
const base = process.env.BASE || 'http://localhost:3001'

async function request(path, opts = {}) {
  const res = await fetch(base + path, opts)
  const txt = await res.text()
  let body = null
  try { body = JSON.parse(txt) } catch (e) { body = txt }
  return { status: res.status, body }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function main() {
  console.log('Running invalid-prescription tests against', base)

  // Wait for backend
  for (let i=0;i<20;i++){
    try { const r = await fetch(base + '/'); if (r.ok) break } catch(e) { await new Promise(r=>setTimeout(r,500)) }
  }

  // Login
  let r = await request('/auth/login', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ username: 'admin', password: 'admin123' }) })
  assert(r.status === 200 && r.body && r.body.token, 'Login failed')
  const token = r.body.token

  // Create a customer to attach prescriptions
  r = await request('/customers', { method: 'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ name: 'InvalidTest' }) })
  assert(r.status === 201 && r.body && r.body.id, 'Create customer failed')
  const customerId = r.body.id

  // 1) Missing provider -> should 400
  r = await request(`/customers/${customerId}/prescriptions`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ pd:'62', od:{ sphere:'-1.00' } }) })
  console.log('case1 status', r.status, 'body', JSON.stringify(r.body))
  assert(r.status === 400, 'Expected 400 for missing provider')
  assert(r.body && r.body.errors && r.body.errors.some(e => e.includes('provider')), 'Expected provider error message')

  // 2) Invalid PD (non-numeric)
  r = await request(`/customers/${customerId}/prescriptions`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ provider:'Dr X', pd:'abc' }) })
  console.log('case2 status', r.status, 'body', JSON.stringify(r.body))
  assert(r.status === 400, 'Expected 400 for bad PD')
  assert(r.body && r.body.errors && r.body.errors.some(e => e.includes('pd')), 'Expected pd error message')

  // 3) Invalid axis (>180)
  r = await request(`/customers/${customerId}/prescriptions`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ provider:'Dr X', od:{ axis:999 } }) })
  console.log('case3 status', r.status, 'body', JSON.stringify(r.body))
  assert(r.status === 400, 'Expected 400 for invalid axis')

  // 4) Invalid sphere out of allowed range
  r = await request(`/customers/${customerId}/prescriptions`, { method:'POST', headers: { 'Content-Type':'application/json','Authorization':'Bearer '+token }, body: JSON.stringify({ provider:'Dr X', od:{ sphere:999 } }) })
  console.log('case4 status', r.status, 'body', JSON.stringify(r.body))
  assert(r.status === 400, 'Expected 400 for invalid sphere')

  console.log('All invalid-prescription tests passed')
}

main().then(()=>process.exit(0)).catch(err=>{ console.error(err); process.exit(2) })
