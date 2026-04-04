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
import contactRoutes from './routes-contact.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'YOUR_STRIPE_SECRET_KEY_HERE');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'TicketApp API is running' });
});

// Authentication
app.use('/api/auth', authRoutes);

// Stripe Checkout
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { basket } = req.body;
    
    // Convert basket items to Stripe line items
    const line_items = basket.map(item => {
      // In a real application, fetch the actual price from the DB here using item.ticketType and item.eventId!
      const amountInCents = Math.round(item.total * 100); 

      return {
        price_data: {
          currency: 'eur', // Adjust if needed
          product_data: {
            name: `Ticket(s) for ${item.eventName} (${item.ticketType})`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1, // 'item.total' already includes 'item.quantity' math based on frontend, so we just pass 1 unit, or change logic to pass quantity
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: line_items,
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact Form
app.use('/api/contact', contactRoutes);

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
