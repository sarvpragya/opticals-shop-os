const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_PATH = path.join(__dirname, '..', 'data', 'data.json');

function ensureDataFile() {
  const dir = path.dirname(DATA_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_PATH)) {
    const initial = { users: [], customers: [], blacklistedTokens: [] };
    fs.writeFileSync(DATA_PATH, JSON.stringify(initial, null, 2));
  }
}

function readDB() {
  ensureDataFile();
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeDB(db) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(db, null, 2));
}

function addUser({ id = uuidv4(), username, passwordHash, role = 'user' }) {
  const db = readDB();
  const user = { id, username, passwordHash, role };
  db.users = db.users || [];
  db.users.push(user);
  writeDB(db);
  return user;
}

function findUserByUsername(username) {
  const db = readDB();
  return (db.users || []).find(u => u.username === username);
}

function listCustomers(q) {
  const db = readDB();
  const customers = db.customers || [];
  if (!q) return customers;
  q = q.toLowerCase();
  return customers.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q)) || (c.email && c.email.toLowerCase().includes(q)) || (c.id && c.id === q));
}

function getCustomerById(id) {
  const db = readDB();
  return (db.customers || []).find(c => c.id === id);
}

function addCustomer({ id = uuidv4(), name, dob, phone, email, address, insurance, tags = [], notes = [] }) {
  const db = readDB();
  db.customers = db.customers || [];
  const customer = { id, name, dob, phone, email, address, insurance, tags, notes, prescriptions: [], attachments: [], createdAt: new Date().toISOString() };
  db.customers.push(customer);
  writeDB(db);
  return customer;
}

function updateCustomer(id, patch) {
  const db = readDB();
  db.customers = db.customers || [];
  const idx = db.customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  db.customers[idx] = Object.assign({}, db.customers[idx], patch, { updatedAt: new Date().toISOString() });
  writeDB(db);
  return db.customers[idx];
}

function deleteCustomer(id) {
  const db = readDB();
  const before = db.customers.length;
  db.customers = (db.customers || []).filter(c => c.id !== id);
  writeDB(db);
  return db.customers.length < before;
}

function addAttachmentToCustomer(customerId, { id = uuidv4(), filename, path: filePath, mimeType, uploadedAt = new Date().toISOString() }) {
  const db = readDB();
  db.customers = db.customers || [];
  const idx = db.customers.findIndex(c => c.id === customerId);
  if (idx === -1) return null;
  const attachment = { id, filename, path: filePath, mimeType, uploadedAt };
  db.customers[idx].attachments = db.customers[idx].attachments || [];
  db.customers[idx].attachments.push(attachment);
  writeDB(db);
  return attachment;
}

function addBlacklistedToken(token, expiresAt) {
  const db = readDB();
  db.blacklistedTokens = db.blacklistedTokens || [];
  db.blacklistedTokens.push({ token, expiresAt });
  writeDB(db);
}

function isTokenBlacklisted(token) {
  const db = readDB();
  db.blacklistedTokens = db.blacklistedTokens || [];
  // clean expired
  const now = Date.now();
  db.blacklistedTokens = db.blacklistedTokens.filter(t => t.expiresAt > now);
  writeDB(db);
  return db.blacklistedTokens.some(t => t.token === token);
}

function addPrescriptionToCustomer(customerId, prescription) {
  const db = readDB();
  db.customers = db.customers || [];
  const idx = db.customers.findIndex(c => c.id === customerId);
  if (idx === -1) return null;
  db.customers[idx].prescriptions = db.customers[idx].prescriptions || [];
  db.customers[idx].prescriptions.push(prescription);
  writeDB(db);
  return prescription;
}

function generateId() {
  return uuidv4();
}

module.exports = {
  ensureDataFile,
  readDB,
  writeDB,
  addUser,
  findUserByUsername,
  listCustomers,
  getCustomerById,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  addBlacklistedToken,
  isTokenBlacklisted,
  addPrescriptionToCustomer,
  generateId,
};
