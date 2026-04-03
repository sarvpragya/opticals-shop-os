Opticals Shop — MVP Prototype

Overview
--------
This repository contains a lightweight MVP prototype for an optical shop management system: a Node/Express backend (`starter-backend`) with JWT auth and customer CRUD, and a React/Vite frontend (`starter-frontend`).

Quick start (development)
-------------------------
- Start backend:

```powershell
cd "C:\Users\admin\Desktop\Opticals solution\starter-backend"
npm install
npm start
```

- Start frontend (Vite):

```powershell
cd "C:\Users\admin\Desktop\Opticals solution\starter-frontend"
npm install
npm run dev
```

Notes
-----
- Default admin user is created automatically on first run: username `admin`, password `admin123`.
- Backend serves uploaded attachments under `/uploads`.
- CI: GitHub Actions workflows are included under `.github/workflows` (build, lint, security checks).

Contributing
------------
- Open issues or feature requests using the issue templates in `.github/ISSUE_TEMPLATE`.

Repository
----------
- Remote: https://github.com/sarvpragya/opticals-shop-os
