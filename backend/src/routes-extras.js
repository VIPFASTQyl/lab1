import express from 'express';
import { getDbPool, sql } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// ===== PAYMENTS =====

// GET /api/extras/payments?orderId=x&status=x
router.get('/payments', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments`;
    const request = pool.request();
    
    if (req.query.orderId) {
      request.input('orderId', sql.Int, req.query.orderId);
      query += ' WHERE OrderId = @orderId';
    }
    if (req.query.status) {
      if (req.query.orderId) {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' AND Status = @status';
      } else {
        request.input('status', sql.NVarChar, req.query.status);
        query += ' WHERE Status = @status';
      }
    }
    query += ' ORDER BY PaymentDate DESC';
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get payments error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/extras/payments/:id
router.get('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments WHERE PaymentId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/extras/payments
router.post('/payments', async (req, res) => {
  const { orderId, amount, paymentMethod, reference } = req.body;
  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({ message: 'OrderId, Amount, and PaymentMethod are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('orderId', sql.Int, orderId)
      .input('amount', sql.Decimal(10, 2), amount)
      .input('paymentMethod', sql.NVarChar, paymentMethod)
      .input('reference', sql.NVarChar, reference || null)
      .query(`INSERT INTO Payments (OrderId, Amount, PaymentMethod, Status, Reference)
              OUTPUT INSERTED.*
              VALUES (@orderId, @amount, @paymentMethod, 'Pending', @reference)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/payments/:id
router.put('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentId FROM Payments WHERE PaymentId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const { amount, status, reference } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('amount', sql.Decimal(10, 2), amount || null)
      .input('status', sql.NVarChar, status || null)
      .input('reference', sql.NVarChar, reference || null)
      .query(`UPDATE Payments
              SET Amount = ISNULL(@amount, Amount),
                  Status = ISNULL(@status, Status),
                  Reference = ISNULL(@reference, Reference)
              WHERE PaymentId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments WHERE PaymentId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/payments/:id
router.delete('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT PaymentId FROM Payments WHERE PaymentId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Payments WHERE PaymentId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== ORGANIZERS =====

// GET /api/extras/organizers
router.get('/organizers', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers ORDER BY Name');
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get organizers error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/extras/organizers/:id
router.get('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers WHERE OrganizerId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/extras/organizers
router.post('/organizers', async (req, res) => {
  const { name, email, phone, address, organizerType, description } = req.body;
  if (!name || !organizerType) {
    return res.status(400).json({ message: 'Name and OrganizerType are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email || null)
      .input('phone', sql.NVarChar, phone || null)
      .input('address', sql.NVarChar, address || null)
      .input('organizerType', sql.NVarChar, organizerType)
      .input('description', sql.NVarChar, description || null)
      .query(`INSERT INTO Organizers (Name, Email, Phone, Address, OrganizerType, Description)
              OUTPUT INSERTED.*
              VALUES (@name, @email, @phone, @address, @organizerType, @description)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/organizers/:id
router.put('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    const { name, email, phone, address, organizerType, description } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('name', sql.NVarChar, name || null)
      .input('email', sql.NVarChar, email || null)
      .input('phone', sql.NVarChar, phone || null)
      .input('address', sql.NVarChar, address || null)
      .input('organizerType', sql.NVarChar, organizerType || null)
      .input('description', sql.NVarChar, description || null)
      .query(`UPDATE Organizers
              SET Name = ISNULL(@name, Name),
                  Email = ISNULL(@email, Email),
                  Phone = ISNULL(@phone, Phone),
                  Address = ISNULL(@address, Address),
                  OrganizerType = ISNULL(@organizerType, OrganizerType),
                  Description = ISNULL(@description, Description)
              WHERE OrganizerId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers WHERE OrganizerId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/organizers/:id
router.delete('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Organizers WHERE OrganizerId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== DISCOUNTS =====

// GET /api/extras/discounts
router.get('/discounts', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query('SELECT DiscountId, Code, Description, Percentage, StartDate, EndDate, Status, CreatedAt FROM Discounts ORDER BY Code');
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get discounts error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/extras/discounts
router.post('/discounts', async (req, res) => {
  const { code, description, percentage, startDate, endDate } = req.body;
  if (!code || percentage === undefined || !startDate || !endDate) {
    return res.status(400).json({ message: 'Code, Percentage, StartDate, and EndDate are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('code', sql.NVarChar, code)
      .input('description', sql.NVarChar, description || null)
      .input('percentage', sql.Decimal(5, 2), percentage)
      .input('startDate', sql.Date, startDate)
      .input('endDate', sql.Date, endDate)
      .query(`INSERT INTO Discounts (Code, Description, Percentage, StartDate, EndDate, Status)
              OUTPUT INSERTED.*
              VALUES (@code, @description, @percentage, @startDate, @endDate, 'Active')`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create discount error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/discounts/:id
router.put('/discounts/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DiscountId FROM Discounts WHERE DiscountId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    const { description, percentage, status } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('description', sql.NVarChar, description || null)
      .input('percentage', sql.Decimal(5, 2), percentage || null)
      .input('status', sql.NVarChar, status || null)
      .query(`UPDATE Discounts
              SET Description = ISNULL(@description, Description),
                  Percentage = ISNULL(@percentage, Percentage),
                  Status = ISNULL(@status, Status)
              WHERE DiscountId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DiscountId, Code, Description, Percentage, StartDate, EndDate, Status, CreatedAt FROM Discounts WHERE DiscountId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update discount error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/discounts/:id
router.delete('/discounts/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT DiscountId FROM Discounts WHERE DiscountId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Discounts WHERE DiscountId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete discount error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== RATINGS =====

// GET /api/extras/ratings?eventId=x&clientId=x
router.get('/ratings', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT RatingId, EventId, ClientId, Rating, Comment, RatingDate FROM Ratings`;
    const request = pool.request();
    
    if (req.query.eventId) {
      request.input('eventId', sql.Int, req.query.eventId);
      query += ' WHERE EventId = @eventId';
    }
    if (req.query.clientId) {
      if (req.query.eventId) {
        request.input('clientId', sql.Int, req.query.clientId);
        query += ' AND ClientId = @clientId';
      } else {
        request.input('clientId', sql.Int, req.query.clientId);
        query += ' WHERE ClientId = @clientId';
      }
    }
    query += ' ORDER BY RatingDate DESC';
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get ratings error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/extras/ratings
router.post('/ratings', async (req, res) => {
  const { eventId, clientId, rating, comment } = req.body;
  if (!eventId || !clientId || rating === undefined) {
    return res.status(400).json({ message: 'EventId, ClientId, and Rating are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('eventId', sql.Int, eventId)
      .input('clientId', sql.Int, clientId)
      .input('rating', sql.Int, rating)
      .input('comment', sql.NVarChar, comment || null)
      .query(`INSERT INTO Ratings (EventId, ClientId, Rating, Comment)
              OUTPUT INSERTED.*
              VALUES (@eventId, @clientId, @rating, @comment)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create rating error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/ratings/:id
router.delete('/ratings/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT RatingId FROM Ratings WHERE RatingId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM Ratings WHERE RatingId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete rating error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
