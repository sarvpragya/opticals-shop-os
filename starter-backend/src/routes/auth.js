const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { addUser, findUserByUsername } = require('../db');

function createRouter(opts = {}) {
  const router = express.Router();
  const JWT_SECRET = opts.JWT_SECRET;

  router.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username and password required' });
    const existing = findUserByUsername(username);
    if (existing) return res.status(400).json({ error: 'user already exists' });
    const passwordHash = bcrypt.hashSync(password, 8);
    const user = addUser({ username, passwordHash, role: role || 'user' });
    res.json({ id: user.id, username: user.username, role: user.role });
  });

  router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = findUserByUsername(username);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = bcrypt.compareSync(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });

  router.post('/logout', (req, res) => {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(400).json({ error: 'Missing token' });
    const token = auth.slice(7);
    try {
      const decoded = jwt.decode(token);
      const expMs = decoded && decoded.exp ? decoded.exp * 1000 : Date.now() + 3600 * 1000;
      const { addBlacklistedToken } = require('../db');
      addBlacklistedToken(token, expMs);
      return res.json({ success: true });
    } catch (err) {
      return res.status(400).json({ error: 'invalid token' });
    }
  });

  return router;
}

module.exports = createRouter;
