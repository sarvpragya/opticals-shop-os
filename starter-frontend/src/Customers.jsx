import React, { useEffect, useState } from 'react'

export default function Customers({ token, onLogout }) {
  const [customers, setCustomers] = useState([])
  const [name, setName] = useState('')
  const [dob, setDob] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [insurance, setInsurance] = useState('')
  const [loading, setLoading] = useState(false)

  async function fetchCustomers() {
    setLoading(true)
    const res = await fetch('http://localhost:3001/customers', { headers: { Authorization: 'Bearer ' + token } })
    const data = await res.json()
    if (res.status === 401) { onLogout && onLogout(); return }
    setCustomers(data)
    setLoading(false)
  }

  useEffect(() => { fetchCustomers() }, [])

  async function createCustomer(e) {
    e.preventDefault()
    const payload = { name, dob, phone, email, address, insurance }
    const res = await fetch('http://localhost:3001/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify(payload)
    })
    if (res.status === 401) { onLogout && onLogout(); return }
    if (res.ok) {
      setName('')
      setDob('')
      setPhone('')
      setEmail('')
      setAddress('')
      setInsurance('')
      fetchCustomers()
    } else {
      alert('Failed to create')
    }
  }

  // upload attachment for a customer; file input provides File
  async function uploadAttachment(customerId, file) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1]
      const res = await fetch(`http://localhost:3001/customers/${customerId}/attachments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ filename: file.name, contentBase64: base64, mimeType: file.type })
      })
      if (res.status === 401) { onLogout && onLogout(); return }
      if (res.ok) fetchCustomers()
      else alert('Upload failed')
    }
    reader.readAsDataURL(file)
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Customers</h3>
      <form onSubmit={createCustomer} style={{ marginBottom: 12, display: 'grid', gap: 6, maxWidth: 480 }}>
        <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} required />
        <input placeholder="DOB (YYYY-MM-DD)" value={dob} onChange={e => setDob(e.target.value)} />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
        <input placeholder="Insurance" value={insurance} onChange={e => setInsurance(e.target.value)} />
        <div>
          <button type="submit">Add Customer</button>
        </div>
      </form>
      {loading ? <div>Loading…</div> : (
        <ul>
          {customers.map(c => (
            <li key={c.id} style={{ marginBottom: 8 }}>
              <strong>{c.name}</strong> — {c.phone || ''} <br />
              {c.email && <span>{c.email} — </span>}{c.insurance && <span>Insurance: {c.insurance}</span>}<br />
              {c.attachments && c.attachments.length > 0 && (
                <div>Attachments:
                  <ul>
                    {c.attachments.map(a => (
                      <li key={a.id}><a href={a.path} target="_blank" rel="noreferrer">{a.filename}</a></li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ marginTop: 6 }}>
                <label style={{ cursor: 'pointer' }}>
                  Upload attachment <input type="file" style={{ display: 'none' }} onChange={e => uploadAttachment(c.id, e.target.files[0])} />
                </label>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
