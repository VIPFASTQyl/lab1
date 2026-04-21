import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// Track active user sessions with timestamps
const activeSessions = new Map();

router.use(authMiddleware);

// Update last activity for user session tracking
router.use((req, res, next) => {
  if (req.user) {
    activeSessions.set(req.user.id, Date.now());
    // Cleanup sessions older than 15 minutes
    for (const [userId, timestamp] of activeSessions.entries()) {
      if (Date.now() - timestamp > 15 * 60 * 1000) {
        activeSessions.delete(userId);
      }
    }
  }
  next();
});

// Only allow admin users to access dashboard endpoints
router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
});

// GET /api/dashboard/summary - Real data dashboard
router.get('/summary', async (req, res) => {
  try {
    const db = await getDbPool();

    // Get active members (currently online users)
    const activeMembers = activeSessions.size;

    // Get ticket statistics
    const ticketsResult = await db.all(
      `SELECT 
        COUNT(*) as totalTickets,
        SUM(CASE WHEN Status = 'Sold' THEN 1 ELSE 0 END) as soldTickets,
        SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) as availableTickets
      FROM Tickets`
    );

    const totalTickets = ticketsResult[0]?.totalTickets || 0;
    const soldTickets = ticketsResult[0]?.soldTickets || 0;
    const availableTickets = ticketsResult[0]?.availableTickets || 0;

    // Get total revenue from completed orders
    const revenueResult = await db.all(
      `SELECT COALESCE(SUM(TotalAmount), 0) as totalRevenue
       FROM Orders 
       WHERE Status IN ('Completed', 'Confirmed')`
    );
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Calculate occupancy percentage
    const occupancyPercentage = totalTickets > 0 ? ((soldTickets / totalTickets) * 100).toFixed(1) : 0;

    return res.json({
      activeMembers,
      totalTickets,
      availableTickets,
      soldTickets,
      occupancyPercentage: parseFloat(occupancyPercentage),
      totalRevenue: parseFloat(totalRevenue).toFixed(2)
    });
  } catch (err) {
    console.error('Dashboard summary error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/dashboard/events - Event performance data
router.get('/events', async (req, res) => {
  try {
    const db = await getDbPool();

    // Get event ticket data
    const eventStats = await db.all(
      `SELECT 
        e.EventId,
        e.Title as eventName,
        COUNT(t.TicketId) as totalCapacity,
        SUM(CASE WHEN t.Status = 'Sold' THEN 1 ELSE 0 END) as ticketsSold,
        COALESCE(SUM(od.Quantity * od.UnitPrice), 0) as revenue
      FROM Events e
      LEFT JOIN Tickets t ON e.EventId = t.EventId
      LEFT JOIN OrderDetails od ON e.EventId = od.EventId
      GROUP BY e.EventId, e.Title
      ORDER BY e.EventId`
    );

    const events = eventStats.map(event => ({
      name: event.eventName,
      total: event.totalCapacity || 0,
      sold: event.ticketsSold || 0,
      available: (event.totalCapacity || 0) - (event.ticketsSold || 0),
      occupancy: event.totalCapacity > 0 ? ((event.ticketsSold || 0) / event.totalCapacity * 100).toFixed(1) : 0,
      revenue: parseFloat(event.revenue || 0).toFixed(2)
    }));

    return res.json(events);
  } catch (err) {
    console.error('Dashboard events error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
