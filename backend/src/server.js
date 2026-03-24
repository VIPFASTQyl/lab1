import express from 'express';
import cors from 'cors';
import { PORT } from './config.js';
import './db.js';
import authRoutes from './routes-auth.js';
import dashboardRoutes from './routes-dashboard.js';
import eventsRoutes from './routes-events.js';
import salesRoutes from './routes-sales.js';
import extrasRoutes from './routes-extras.js';
import relationsRoutes from './routes-relations.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'TicketApp API is running' });
});

// Authentication
app.use('/api/auth', authRoutes);

// Admin Dashboard
app.use('/api/dashboard', dashboardRoutes);

// Events Management (Venues, Sectors, Events)
app.use('/api/events', eventsRoutes);

// Sales Management (Clients, Tickets, Orders, OrderDetails)
app.use('/api/sales', salesRoutes);

// Extra Features (Payments, Organizers, Discounts, Ratings)
app.use('/api/extras', extrasRoutes);

// Relations (EventOrganizers)
app.use('/api/relations', relationsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`TicketApp API running on port ${PORT}`);
});
