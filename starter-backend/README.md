# Starter Backend — Optical Shop OS

This is a minimal starter backend for the Optical Shop OS MVP. It provides:

- JWT authentication (register/login)
- Customer CRUD endpoints (protected)

Quick start

1. Install dependencies

```bash
cd "C:/Users/admin/Desktop/Opticals solution/starter-backend"
npm install
```

2. Run the server

```bash
npm start
```

The server will start on port 3000 by default.

Default admin user (created automatically on first run):

- username: admin
- password: admin123

API endpoints

- POST /auth/register { username, password, role }
- POST /auth/login { username, password } -> { token }
- GET /customers (Authorization: Bearer <token>)
- POST /customers { name, dob, phone, email, address, insurance }
- GET /customers/:id
- PUT /customers/:id
- DELETE /customers/:id

Notes

- This is a prototype using a simple JSON file for storage (`data/data.json`). For production, replace the storage layer with Postgres or other DB and add proper security and validation.
