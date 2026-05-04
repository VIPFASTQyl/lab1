# Quick Start (MySQL + Full Backend Integration)

## 1) Configure Environment
Create backend/.env from backend/.env.example:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=ticketapp_db

JWT_SECRET=change_this_secret

EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

## 2) Create MySQL Schema
Run:

- backend/db-schema-mysql.sql

This creates all operational tables:
Users, Venues, Events, Sectors, Tickets, Clients, Orders, OrderDetails, Payments, Organizers, EventOrganizers, Discounts, Ratings, Partners.

## 3) Install Dependencies
From repository root:

```bash
npm install
```

## 4) Start Frontend + Backend
From repository root:

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 5) Verify MySQL Backend Is Running
Health endpoint:

- GET /api/mysql/health

Expected response:

```json
{ "ok": true, "engine": "mysql" }
```

## 6) New MySQL CRUD API
Generic endpoints:

- GET /api/mysql/:resource
- GET /api/mysql/:resource/:id
- POST /api/mysql/:resource
- PUT /api/mysql/:resource/:id
- DELETE /api/mysql/:resource/:id

Resources:

- users
- venues
- events
- sectors
- tickets
- clients
- orders
- order-details
- payments
- organizers
- event-organizers
- discounts
- ratings
- partners

Notes:

- GET routes are public.
- POST/PUT/DELETE require Authorization: Bearer <token>.

## 7) Frontend Integration Included
The frontend event flow now uses backend data instead of static local event definitions:

- Event listing pulls from GET /api/mysql/events-catalog
- Event create/update/delete uses MySQL catalog routes
- Payment flow books tickets via POST /api/mysql/bookings
- Event data refreshes after booking so availability updates in UI
