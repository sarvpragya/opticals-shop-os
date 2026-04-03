# Optical Shop OS — MVP Timeline & Resource Plan

## Overview
This document provides a 10–12 week Gantt-style timeline for the MVP, sprint milestones, deliverables, resource assignments, and a rough cost estimate. The plan assumes a small core team and continuous iteration with a pilot at the end.

---

## Key assumptions
- Team: 1 Backend (FT), 1 Frontend (FT), 1 Full-stack (PT), 1 Designer (PT), 1 QA (PT), shared DevOps
- Working cadence: 2-week sprints (some sprints condensed to 1 week for fast feedback)
- CI/CD, repo, and staging infra available in Week 0
- MVP scope: customers, prescriptions, inventory, POS, appointments, reporting, basic integrations

---

## High-level schedule (10–12 weeks)

- Week 0 (Setup, 3–5 days)
  - Activities: finalize requirements, repo scaffold, infra provisioning, CI pipeline, seed data, authentication baseline
  - Deliverables: repo with README, basic API skeleton, auth working, staging environment

- Weeks 1–2 (Sprint 1)
  - Focus: Auth/RBAC, Customer CRUD, DB models, basic UI
  - Deliverables: login, roles, customer create/search/update, simple timeline stub
  - Acceptance: secure login, customer CRUD passes tests, role enforcement

- Weeks 3–4 (Sprint 2)
  - Focus: Prescription management, attachments, timeline enhancements, printing/export templates
  - Deliverables: prescription form, attach scanned scripts, print/export prescription slip, timeline integrated
  - Acceptance: numeric validation, PDF/CSV exports, uploads visible in timeline

- Weeks 5–6 (Sprint 3)
  - Focus: Inventory SKUs, POs, receiving, stock adjustments, audit log
  - Deliverables: SKU catalog, PO flow, stock receive updating levels, stock audit entries, low-stock alerts
  - Acceptance: accurate stock movements, PO receive updates inventory, CSV import/export

- Weeks 7–8 (Sprint 4)
  - Focus: POS/cart, payment stub, receipts, returns, lab order CSV, barcode scanning
  - Deliverables: checkout flow, receipts (print/email), returns workflow, lab CSV export, barcode scan support
  - Acceptance: complete sale recorded, receipt generated, returns decrement/increment stock properly

- Weeks 9–10 (Sprint 5)
  - Focus: Appointments, reporting, scheduled exports, integrations polish, tests
  - Deliverables: appointment UI/provider calendar, reports (daily sales, inventory), scheduled job for reports (placeholder email), final integrations (printer/lab CSV)
  - Acceptance: provider availability respected, exports working, reports match transactions

- Weeks 11–12 (Polish & Pilot)
  - Focus: bug fixes, UX polish, docs/training material, staging->pilot deploy, pilot onboarding
  - Deliverables: staging release, pilot environment, admin docs, training checklist, pilot plan
  - Acceptance: pilot-ready system, basic runbook for pilot stores, first pilot installations scheduled

---

## Sprint-level milestones and checkpoints
- End of Sprint 1 (Week 2): Basic auth + customer master ready for demos
- End of Sprint 2 (Week 4): Clinical prescription capture and print/export ready
- End of Sprint 3 (Week 6): Inventory and PO cycle validated with audit trails
- End of Sprint 4 (Week 8): POS and lab order flow demoable in-store
- End of Sprint 5 (Week 10): Reporting and appointments complete; integration smoke tested
- Pilot launch (Week 11–12): Deploy to 1–2 pilot stores and collect feedback

---

## Resource allocation (recommended)
- Backend engineer: 40 h/week — APIs, DB, business logic, integrations
- Frontend engineer: 40 h/week — React SPA, POS UI, barcode flows, print templates
- Full-stack engineer (integration): 15–20 h/week — DevOps, printers, lab CSVs, payment stubs
- Designer: 8–12 h/week — UI kit, Figma wireframes, usability fixes
- QA: 8–12 h/week — test plans, regression, acceptance testing
- DevOps: shared (on-demand) — infra, DB backups, deployment scripts

---

## Rough cost estimate (MVP)
Costs vary by region and hiring model. Example mid-market blended rates (conservative):
- Backend: $60/hr, Frontend: $60/hr, Full-stack: $70/hr, Designer: $45/hr, QA: $40/hr, DevOps: $80/hr (part-time)
- Approximate engineering hours (12 weeks):
  - Backend: 480h, Frontend: 480h, Full-stack: 180h, Designer: 120h, QA: 120h
- Ballpark cost: $60k–$120k USD (depending on hourly rates, contractor vs agency vs in-house discounts)

Note: for a lean build using offshore resources or contractors, cost can be significantly lower; for agency/US-market rates, expect the high end.

---

## Risks & mitigations
- Scope creep: use strict MVP gating and prioritize by business value
- Device integrations (printers, scanners) vary by hardware: start with ESC/POS and keyboard-scanner emulation
- Compliance (GDPR/HIPAA): plan for encryption, logging, and legal review early
- Pilot adoption: choose 1–2 friendly local partners and clear success metrics

---

## Deliverables checklist (by the end of MVP)
- Working staging deployment with authentication and RBAC
- Customer and prescription workflows with attachments and print/export
- Inventory management with POs, receive flow, and audit logs
- POS checkout, receipts, returns, barcode scanning, lab CSV export
- Appointments UI + provider calendar
- Reporting (PDF/CSV) and scheduled report capability (placeholder email)
- Basic docs: install/run, pilot checklist, user quickstart

---

## Next steps (recommended)
1. Approve timeline and resource plan.
2. Kick off Week 0: scaffold repo, set up CI/CD, and create seed data templates.
3. Create a prioritized backlog in the ticketing tool (Jira/GitHub Projects) and schedule Sprint 1 planning.

---

If you want, I can now scaffold a starter repo (backend + frontend) with auth and customer CRUD to begin Week 0 — which should I create next: `repo scaffold` or `detailed Gantt (spreadsheet)`? 
