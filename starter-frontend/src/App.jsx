import React, { useState } from 'react'
import Login from './Login'
import Customers from './Customers'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))

  function handleLogin(token) {
    localStorage.setItem('token', token)
    setToken(token)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <h2>Opticals — Starter</h2>
      {token ? (
        <div>
          <button onClick={handleLogout}>Logout</button>
          <Customers token={token} onLogout={handleLogout} />
        </div>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  )
}
