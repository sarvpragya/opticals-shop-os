const express = require('express');
const authMiddleware = require('../middleware/auth');
const { listCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer } = require('../db');

function createRouter(opts = {}) {
  const router = express.Router();
  const JWT_SECRET = opts.JWT_SECRET;

  router.use(authMiddleware({ JWT_SECRET }));

  router.get('/', (req, res) => {
    const q = req.query.q || '';
    const items = listCustomers(q);
    res.json(items);
  });

  router.get('/:id', (req, res) => {
    const item = getCustomerById(req.params.id);
    if (!item) return res.status(404).json({ error: 'not found' });
    res.json(item);
  });

  router.post('/', (req, res) => {
    const { name, dob, phone, email, address, insurance, tags } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const customer = addCustomer({ name, dob, phone, email, address, insurance, tags });
    res.status(201).json(customer);
  });

  // upload attachment as base64 JSON: { filename, contentBase64, mimeType }
  router.post('/:id/attachments', (req, res) => {
    const id = req.params.id;
    const { filename, contentBase64, mimeType } = req.body;
    if (!filename || !contentBase64) return res.status(400).json({ error: 'filename and contentBase64 required' });
    const buffer = Buffer.from(contentBase64, 'base64');
    const uploadsDir = require('path').join(__dirname, '..', '..', 'data', 'uploads');
    if (!require('fs').existsSync(uploadsDir)) require('fs').mkdirSync(uploadsDir, { recursive: true });
    const fileId = Date.now() + '-' + filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const filePath = require('path').join(uploadsDir, fileId);
    require('fs').writeFileSync(filePath, buffer);
    const publicPath = `/uploads/${fileId}`;
    const attachment = addAttachmentToCustomer(id, { filename, path: publicPath, mimeType });
    if (!attachment) return res.status(404).json({ error: 'customer not found' });
    res.status(201).json(attachment);
  });

  router.put('/:id', (req, res) => {
    const updated = updateCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'not found' });
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    const ok = deleteCustomer(req.params.id);
    if (!ok) return res.status(404).json({ error: 'not found' });
    res.json({ success: true });
  });

  return router;
}

module.exports = createRouter;
