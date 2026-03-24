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
    const result = await pool
      .request()
      .query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients ORDER BY FirstName');
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get clients error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/clients/:id
router.get('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients WHERE ClientId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    return res.json(result.recordset[0]);
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
    const result = await pool
      .request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone || null)
      .input('address', sql.NVarChar, address || null)
      .query(`INSERT INTO Clients (FirstName, LastName, Email, Phone, Address)
              OUTPUT INSERTED.*
              VALUES (@firstName, @lastName, @email, @phone, @address)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/clients/:id
router.put('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT ClientId FROM Clients WHERE ClientId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    const { firstName, lastName, email, phone, address } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('firstName', sql.NVarChar, firstName || null)
      .input('lastName', sql.NVarChar, lastName || null)
      .input('email', sql.NVarChar, email || null)
      .input('phone', sql.NVarChar, phone || null)
      .input('address', sql.NVarChar, address || null)
      .query(`UPDATE Clients
              SET FirstName = ISNULL(@firstName, FirstName),
                  LastName = ISNULL(@lastName, LastName),
                  Email = ISNULL(@email, Email),
                  Phone = ISNULL(@phone, Phone),
                  Address = ISNULL(@address, Address)
              WHERE ClientId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT ClientId, FirstName, LastName, Email, Phone, Address, RegistrationDate FROM Clients WHERE ClientId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update client error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/clients/:id
router.delete('/clients/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT ClientId FROM Clients WHERE ClientId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Clients WHERE ClientId = @id');
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
    const request = pool.request();
    
    if (req.query.eventId) {
      request.input('eventId', sql.Int, req.query.eventId);
      query += ' WHERE EventId = @eventId';
    }
    if (req.query.status) {
      if (req.query.eventId) {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' AND Status = @status';
      } else {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' WHERE Status = @status';
      }
    }
    query += ' ORDER BY SeatNumber';
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get tickets error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/tickets/:id
router.get('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets WHERE TicketId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    return res.json(result.recordset[0]);
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
    const result = await pool
      .request()
      .input('eventId', sql.Int, eventId)
      .input('sectorId', sql.Int, sectorId)
      .input('seatNumber', sql.NVarChar, seatNumber)
      .input('price', sql.Decimal(10, 2), price)
      .input('ticketType', sql.NVarChar, ticketType || 'General')
      .query(`INSERT INTO Tickets (EventId, SectorId, SeatNumber, Price, Status, TicketType)
              OUTPUT INSERTED.*
              VALUES (@eventId, @sectorId, @seatNumber, @price, 'Available', @ticketType)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/tickets/:id
router.put('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT TicketId FROM Tickets WHERE TicketId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    const { price, status, ticketType } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('price', sql.Decimal(10, 2), price || null)
      .input('status', sql.NVarChar, status || null)
      .input('ticketType', sql.NVarChar, ticketType || null)
      .query(`UPDATE Tickets
              SET Price = ISNULL(@price, Price),
                  Status = ISNULL(@status, Status),
                  TicketType = ISNULL(@ticketType, TicketType)
              WHERE TicketId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT TicketId, EventId, SectorId, SeatNumber, Price, Status, TicketType, CreatedAt FROM Tickets WHERE TicketId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/tickets/:id
router.delete('/tickets/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT TicketId FROM Tickets WHERE TicketId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Tickets WHERE TicketId = @id');
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
    const request = pool.request();
    
    if (req.query.clientId) {
      request.input('clientId', sql.Int, req.query.clientId);
      query += ' WHERE ClientId = @clientId';
    }
    if (req.query.status) {
      if (req.query.clientId) {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' AND Status = @status';
      } else {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' WHERE Status = @status';
      }
    }
    query += ' ORDER BY OrderDate DESC';
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get orders error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/orders/:id
router.get('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders WHERE OrderId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    return res.json(result.recordset[0]);
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
    const result = await pool
      .request()
      .input('clientId', sql.Int, clientId)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount || 0)
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .query(`INSERT INTO Orders (ClientId, TotalAmount, Status, PaymentMethod)
              OUTPUT INSERTED.*
              VALUES (@clientId, @totalAmount, 'Pending', @paymentMethod)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/orders/:id
router.put('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrderId FROM Orders WHERE OrderId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    const { totalAmount, status, paymentMethod } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('totalAmount', sql.Decimal(10, 2), totalAmount || null)
      .input('status', sql.NVarChar, status || null)
      .input('paymentMethod', sql.NVarChar, paymentMethod || null)
      .query(`UPDATE Orders
              SET TotalAmount = ISNULL(@totalAmount, TotalAmount),
                  Status = ISNULL(@status, Status),
                  PaymentMethod = ISNULL(@paymentMethod, PaymentMethod),
                  UpdatedAt = GETUTCDATE()
              WHERE OrderId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrderId, ClientId, OrderDate, TotalAmount, Status, PaymentMethod, CreatedAt, UpdatedAt FROM Orders WHERE OrderId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update order error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/sales/orders/:id
router.delete('/orders/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrderId FROM Orders WHERE OrderId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Orders WHERE OrderId = @id');
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
      const result = await pool
        .request()
        .input('orderId', sql.Int, req.query.orderId)
        .query(query + ' WHERE OrderId = @orderId');
      return res.json(result.recordset);
    }
    const result = await pool.request().query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get order details error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/sales/order-details/:id
router.get('/order-details/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DetailId, OrderId, TicketId, Quantity, UnitPrice, TotalPrice FROM OrderDetails WHERE DetailId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    return res.json(result.recordset[0]);
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
    const result = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('ticketId', sql.Int, ticketId)
      .input('quantity', sql.Int, quantity)
      .input('unitPrice', sql.Decimal(10, 2), unitPrice)
      .input('totalPrice', sql.Decimal(10, 2), totalPrice)
      .query(`INSERT INTO OrderDetails (OrderId, TicketId, Quantity, UnitPrice, TotalPrice)
              OUTPUT INSERTED.*
              VALUES (@orderId, @ticketId, @quantity, @unitPrice, @totalPrice)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/sales/order-details/:id
router.put('/order-details/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DetailId FROM OrderDetails WHERE DetailId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    const { quantity, unitPrice, totalPrice } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('quantity', sql.Int, quantity)
      .input('unitPrice', sql.Decimal(10, 2), unitPrice)
      .input('totalPrice', sql.Decimal(10, 2), totalPrice)
      .query(`UPDATE OrderDetails
              SET Quantity = ISNULL(@quantity, Quantity),
                  UnitPrice = ISNULL(@unitPrice, UnitPrice),
                  TotalPrice = ISNULL(@totalPrice, TotalPrice)
              WHERE DetailId = @id`);
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
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DetailId FROM OrderDetails WHERE DetailId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Order detail not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM OrderDetails WHERE DetailId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete order detail error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
