import express from 'express';
import { getDbPool, sql } from './db.js';
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
    const pool = await getDbPool();

    const totalTickets = await pool.request().query('SELECT COUNT(*) as Total FROM Tickets');
    const openTickets = await pool
      .request()
      .input('status', sql.NVarChar, 'Open')
      .query('SELECT COUNT(*) as Total FROM Tickets WHERE Status = @status');
    const closedTickets = await pool
      .request()
      .input('status', sql.NVarChar, 'Closed')
      .query('SELECT COUNT(*) as Total FROM Tickets WHERE Status = @status');

    return res.json({
      totalTickets: totalTickets.recordset[0].Total,
      openTickets: openTickets.recordset[0].Total,
      closedTickets: closedTickets.recordset[0].Total
    });
  } catch (err) {
    console.error('Dashboard summary error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
