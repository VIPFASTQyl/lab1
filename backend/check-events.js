const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const mysql = require('mysql2/promise');

async function run() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ticketapp_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const sql = `SELECT 
        e.EventId,
        e.Title as eventName,
        COUNT(t.TicketId) as totalCapacity,
        SUM(CASE WHEN t.Status = 'Sold' THEN 1 ELSE 0 END) as ticketsSold,
        COALESCE(SUM(od.Quantity * od.UnitPrice), 0) as revenue
      FROM Events e
      LEFT JOIN Tickets t ON e.EventId = t.EventId
      LEFT JOIN OrderDetails od ON e.EventId = od.EventId
      GROUP BY e.EventId, e.Title
      ORDER BY e.EventId`;

  try {
    const [rows] = await pool.execute(sql);
    console.log('Query OK. Rows:', rows.length);
    console.dir(rows, { depth: null, maxArrayLength: null });
  } catch (err) {
    console.error('SQL Error:', err);
  } finally {
    await pool.end();
  }
}

run();
