import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// ===== CLIENTS =====

// GET /api/sales/clients
router.get('/clients', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients ORDER BY FirstName');
    return res.json(results);
  } catch (err) {
    console.error('Get clients error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/clients/:id
router.get('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients WHERE ClientId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/sales/clients
router.post('/clients', async (req, res) => {
  const { firstName, lastName, email, phone, address } = req.body;
  if (!firstName || !lastName || !email) {
    return res.status(400).json({ message: 'FirstName, LastName, and Email are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool.query(`INSERT INTO Clients (FirstName, LastName, Email, Phone, Address)
              VALUES (?, ?, ?, ?, ?)`, [firstName, lastName, email, phone || null, address || null]);
    const [inserted] = await pool.query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients WHERE ClientId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/clients/:id
router.put('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT ClientId FROM Clients WHERE ClientId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const { firstName, lastName, email, phone, address } = req.body;
    await pool.query(`UPDATE Clients
              SET FirstName = COALESCE(?, FirstName),
                  LastName = COALESCE(?, LastName),
                  Email = COALESCE(?, Email),
                  Phone = COALESCE(?, Phone),
                  Address = COALESCE(?, Address)
              WHERE ClientId = ?`, [firstName || null, lastName || null, email || null, phone || null, address || null, req.params.id]);
    const [updated] = await pool.query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients WHERE ClientId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/clients/:id
router.delete('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT ClientId FROM Clients WHERE ClientId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    await pool.query('DELETE FROM Clients WHERE ClientId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== TICKETS =====

// GET /api/sales/tickets?eventId=x&status=x
router.get('/tickets', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets`;
    const params = [];
    
    if (req.query.eventId) {
      query += ' WHERE EventId = ?';
      params.push(req.query.eventId);
    }
    if (req.query.status) {
      if (req.query.eventId) {
        query += ' AND Status = ?';
      } else {
        query += ' WHERE Status = ?';
      }
      params.push(req.query.status);
    }
    query += ' ORDER BY SeatNumber';
    const [results] = await pool.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get tickets error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/tickets/:id
router.get('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets WHERE TicketId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/sales/tickets
router.post('/tickets', async (req, res) => {
  const { eventId, sectorId, seatNumber, price, ticketType } = req.body;
  if (!eventId || !sectorId || !seatNumber || price === undefined) {
    return res.status(400).json({ message: 'EventId, SectorId, SeatNumber, and Price are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool.query(`INSERT INTO Tickets (EventId, SectorId, SeatNumber, Price, Status, TicketType)
              VALUES (?, ?, ?, ?, 'Available', ?)`, [eventId, sectorId, seatNumber, price, ticketType || 'General']);
    const [inserted] = await pool.query('SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets WHERE TicketId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/tickets/:id
router.put('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT TicketId FROM Tickets WHERE TicketId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const { price, status, ticketType } = req.body;
    await pool.query(`UPDATE Tickets
              SET Price = COALESCE(?, Price),
                  Status = COALESCE(?, Status),
                  TicketType = COALESCE(?, TicketType)
              WHERE TicketId = ?`, [price || null, status || null, ticketType || null, req.params.id]);
    const [updated] = await pool.query('SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets WHERE TicketId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/tickets/:id
router.delete('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT TicketId FROM Tickets WHERE TicketId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await pool.query('DELETE FROM Tickets WHERE TicketId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ORDERS =====

// GET /api/sales/orders?clientId=x&status=x
router.get('/orders', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders`;
    const params = [];
    
    if (req.query.clientId) {
      query += ' WHERE ClientId = ?';
      params.push(req.query.clientId);
    }
    if (req.query.status) {
      if (req.query.clientId) {
        query += ' AND Status = ?';
      } else {
        query += ' WHERE Status = ?';
      }
      params.push(req.query.status);
    }
    query += ' ORDER BY OrderDate DESC';
    const [results] = await pool.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get orders error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders WHERE OrderId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/sales/orders
router.post('/orders', async (req, res) => {
  const { clientId, totalAmount, paymentMethod } = req.body;
  if (!clientId) {
    return res.status(400).json({ message: 'ClientId is required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool.query(`INSERT INTO Orders (ClientId, TotalAmount, Status, PaymentMethod)
              VALUES (?, ?, 'Pending', ?)`, [clientId, totalAmount || 0, paymentMethod || null]);
    const [inserted] = await pool.query('SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders WHERE OrderId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/orders/:id
router.put('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT OrderId FROM Orders WHERE OrderId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const { totalAmount, status, paymentMethod } = req.body;
    await pool.query(`UPDATE Orders
              SET TotalAmount = COALESCE(?, TotalAmount),
                  Status = COALESCE(?, Status),
                  PaymentMethod = COALESCE(?, PaymentMethod),
                  UpdatedAt = NOW()
              WHERE OrderId = ?`, [totalAmount || null, status || null, paymentMethod || null, req.params.id]);
    const [updated] = await pool.query('SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders WHERE OrderId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/orders/:id
router.delete('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT OrderId FROM Orders WHERE OrderId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await pool.query('DELETE FROM Orders WHERE OrderId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ORDER DETAILS =====

// GET /api/sales/order-details?orderId=x
router.get('/order-details', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT DetailId, OrderId, TicketId, Quantity, UnitPrice, TotalPrice FROM OrderDetails`;
    if (req.query.orderId) {
      const [results] = await pool.query(query + ' WHERE OrderId = ?', [req.query.orderId]);
      return res.json(results);
    }
    const [results] = await pool.query(query);
    return res.json(results);
  } catch (err) {
    console.error('Get order details error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/order-details/:id
router.get('/order-details/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT DetailId, OrderId, TicketId, Quantity, UnitPrice, TotalPrice FROM OrderDetails WHERE DetailId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/sales/order-details
router.post('/order-details', async (req, res) => {
  const { orderId, ticketId, quantity, unitPrice, totalPrice } = req.body;
  if (!orderId || !ticketId || !quantity || unitPrice === undefined || totalPrice === undefined) {
    return res.status(400).json({ message: 'OrderId, TicketId, Quantity, UnitPrice, and TotalPrice are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool.query(`INSERT INTO OrderDetails (OrderId, TicketId, Quantity, UnitPrice, TotalPrice)
              VALUES (?, ?, ?, ?, ?)`, [orderId, ticketId, quantity, unitPrice, totalPrice]);
    const [inserted] = await pool.query('SELECT DetailId, OrderId, TicketId, Quantity, UnitPrice, TotalPrice FROM OrderDetails WHERE DetailId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/order-details/:id
router.put('/order-details/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT DetailId FROM OrderDetails WHERE DetailId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    const { quantity, unitPrice, totalPrice } = req.body;
    await pool.query(`UPDATE OrderDetails
              SET Quantity = COALESCE(?, Quantity),
                  UnitPrice = COALESCE(?, UnitPrice),
                  TotalPrice = COALESCE(?, TotalPrice)
              WHERE DetailId = ?`, [quantity, unitPrice, totalPrice, req.params.id]);
    return res.json({ message: 'Order detail updated successfully' });
  } catch (err) {
    console.error('Update order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/order-details/:id
router.delete('/order-details/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT DetailId FROM OrderDetails WHERE DetailId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    await pool.query('DELETE FROM OrderDetails WHERE DetailId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
