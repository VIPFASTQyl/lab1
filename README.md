# TicketApp (Node.js, React, MySQL)

## Stack
- Backend: Node.js, Express, MSSQL (`mssql`), JWT, bcrypt
- Backend: Node.js, Express, MySQL (`mysql2`), JWT, bcrypt
- Frontend: React + React Router (Vite)
- Database: MySQL

## Backend

Location: `backend`

### Setup
1. In `backend`, install dependencies:
   - `npm install`
2. Create a `.env` file in `backend` with:

   ```env
   PORT=5000
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=root
  DB_NAME=ticketapp_db
   JWT_SECRET=change_this_secret
  FRONTEND_URL=http://localhost:3000
   ```

3. Create the database and tables by executing `backend/db-schema-mysql.sql` in MySQL.
4. Run the API:
   - `npm run dev`

### API Overview

Base URL: `http://localhost:5000`

#### Auth
- `POST /api/auth/register`
  - Body: `{ "name": string, "email": string, "password": string }`
  - Response: `201 Created` on success

- `POST /api/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `{ "token": string }`

Use the returned JWT as:
- `Authorization: Bearer <token>`

#### MySQL CRUD (new)
- `GET /api/mysql/:resource`
- `GET /api/mysql/:resource/:id`
- `POST /api/mysql/:resource` (protected)
- `PUT /api/mysql/:resource/:id` (protected)
- `DELETE /api/mysql/:resource/:id` (protected)

Supported `:resource` values:
- `users`, `venues`, `events`, `sectors`, `tickets`, `clients`, `orders`, `order-details`, `payments`, `organizers`, `event-organizers`, `discounts`, `ratings`, `partners`

#### Event Catalog + Booking (new)
- `GET /api/mysql/events-catalog` (public): returns event/ticket availability used by frontend
- `POST /api/mysql/events-catalog` (protected): create event + ticket inventory
- `PUT /api/mysql/events-catalog/:id` (protected): update event + ticket inventory
- `DELETE /api/mysql/events-catalog/:id` (protected)
- `POST /api/mysql/bookings` (protected): books available tickets and marks them sold

#### Dashboard (protected)
- `GET /api/dashboard/summary`
  - Response example:
    ```json
    {
      "totalTickets": 10,
      "openTickets": 7,
      "closedTickets": 3
    }
    ```

## Frontend

Location: `frontend`

### Setup
1. In `frontend`, install dependencies:
   - `npm install`
2. Start dev server:
   - `npm run dev`
3. Frontend dev server (port 3000) proxies `/api` to backend `http://localhost:5000`.

### Run Both Apps Together
From repository root:
- `npm install`
- `npm run dev`

### Pages
- `/login` — login form, stores JWT in `localStorage`.
- `/dashboard` — protected dashboard view with ticket summary.
- `/tickets` — protected page to list existing tickets and create new tickets.

You can style the React components (forms, tables, dashboard cards) using Bootstrap or Tailwind as required by the assignment.


