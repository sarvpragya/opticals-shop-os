const jwt = require('jsonwebtoken');

function authMiddleware(options = {}) {
  const { JWT_SECRET } = options;
  return function (req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
    const token = auth.slice(7);
    const { isTokenBlacklisted } = require('../db');
    if (isTokenBlacklisted(token)) return res.status(401).json({ error: 'Token revoked' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}

module.exports = authMiddleware;
