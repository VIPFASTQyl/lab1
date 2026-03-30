# TicketApp (Node.js, React, MSSQL)

## Stack
- Backend: Node.js, Express, MSSQL (`mssql`), JWT, bcrypt
- Frontend: React + React Router (Vite)
- Database: Microsoft SQL Server

## Backend

Location: `backend`

### Setup
1. In `backend`, install dependencies:
   - `npm install`
2. Create a `.env` file in `backend` with:

   ```env
   PORT=5000
   DB_USER=sa
   DB_PASSWORD=YourStrong!Passw0rd
   DB_SERVER=localhost
   DB_NAME=TicketAppDb
   JWT_SECRET=change_this_secret
   ```

3. Create the database and tables by executing `db-schema.sql` in your MSSQL server.
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

#### Tickets (protected)
- `GET /api/tickets`
  - Returns list of tickets.

- `GET /api/tickets/:id`
  - Returns a single ticket.

- `POST /api/tickets`
  - Body: `{ "title": string, "description"?: string, "status"?: string, "priority"?: string }`
  - Creates and returns the new ticket.

- `PUT /api/tickets/:id`
  - Body: any subset of ticket fields to update.

- `DELETE /api/tickets/:id`
  - Deletes a ticket.

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

### Pages
- `/login` — login form, stores JWT in `localStorage`.
- `/dashboard` — protected dashboard view with ticket summary.
- `/tickets` — protected page to list existing tickets and create new tickets.

You can style the React components (forms, tables, dashboard cards) using Bootstrap or Tailwind as required by the assignment.


