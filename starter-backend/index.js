const express = require('express');
const path = require('path');
const bodyParser = require('express').json;
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ensureDataFile, readDB, writeDB, addUser, findUserByUsername } = require('./src/db');

const authRoutes = require('./src/routes/auth');
const customerRoutes = require('./src/routes/customers');
const prescriptionsRoutes = require('./src/routes/prescriptions');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

async function main() {
  ensureDataFile();

  const app = express();
  app.use(cors());
  app.use(bodyParser());

  // serve uploaded files
  const uploadsDir = path.join(__dirname, '..', 'data', 'uploads');
  if (!require('fs').existsSync(uploadsDir)) require('fs').mkdirSync(uploadsDir, { recursive: true });
  app.use('/uploads', express.static(uploadsDir));

  // Simple health
  app.get('/', (req, res) => res.json({ status: 'ok', version: '0.1.0' }));

  // attach routes (they will use JWT_SECRET from env)
  app.use('/auth', authRoutes({ JWT_SECRET }));
  app.use('/customers', customerRoutes({ JWT_SECRET }));
  app.use('/', prescriptionsRoutes);

  // ensure admin user exists
  const db = readDB();
  if (!db.users || db.users.length === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 8);
    addUser({ id: 'user-admin', username: 'admin', passwordHash, role: 'admin' });
    console.log('Created default admin user: username=admin password=admin123');
  }

  app.listen(PORT, () => console.log(`Starter backend listening on http://localhost:${PORT}`));
}

main();
