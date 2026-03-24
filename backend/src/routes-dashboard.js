import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// Only allow admin users to access dashboard endpoints
router.use((req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
});

// GET /api/dashboard/summary
router.get('/summary', async (req, res) => {
  try {
    const db = await getDbPool();

    const totalTicketsResult = await db.all('SELECT COUNT(*) as Total FROM Tickets');
    const openTicketsResult = await db.all('SELECT COUNT(*) as Total FROM Tickets WHERE Status = ?', ['Available']);
    const soldTicketsResult = await db.all('SELECT COUNT(*) as Total FROM Tickets WHERE Status = ?', ['Sold']);

    return res.json({
      totalTickets: totalTicketsResult[0].Total,
      availableTickets: openTicketsResult[0].Total,
      soldTickets: soldTicketsResult[0].Total
    });
  } catch (err) {
    console.error('Dashboard summary error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
