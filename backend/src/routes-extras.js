import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// ===== PAYMENTS =====

// GET /api/extras/payments?orderId=x&status=x
router.get('/payments', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments`;
    const params = [];
    
    if (req.query.orderId) {
      query += ' WHERE OrderId = ?';
      params.push(req.query.orderId);
    }
    if (req.query.status) {
      if (req.query.orderId) {
        query += ' AND Status = ?';
      } else {
        query += ' WHERE Status = ?';
      }
      params.push(req.query.status);
    }
    query += ' ORDER BY PaymentDate DESC';
    const [results] = await pool.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get payments error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/extras/payments/:id
router.get('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments WHERE PaymentId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    return res.json(results[0]);
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
    const result = await pool.query(`INSERT INTO Payments (OrderId, Amount, PaymentMethod, Status, Reference)
              VALUES (?, ?, ?, 'Pending', ?)`, [orderId, amount, paymentMethod, reference || null]);
    const [inserted] = await pool.query('SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments WHERE PaymentId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/payments/:id
router.put('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT PaymentId FROM Payments WHERE PaymentId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    const { amount, status, reference } = req.body;
    await pool.query(`UPDATE Payments
              SET Amount = COALESCE(?, Amount),
                  Status = COALESCE(?, Status),
                  Reference = COALESCE(?, Reference)
              WHERE PaymentId = ?`, [amount || null, status || null, reference || null, req.params.id]);
    const [updated] = await pool.query('SELECT PaymentId, OrderId, PaymentDate, Amount, PaymentMethod, Status, Reference, CreatedAt FROM Payments WHERE PaymentId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update payment error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/payments/:id
router.delete('/payments/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT PaymentId FROM Payments WHERE PaymentId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    await pool.query('DELETE FROM Payments WHERE PaymentId = ?', [req.params.id]);
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
    const [results] = await pool.query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers ORDER BY Name');
    return res.json(results);
  } catch (err) {
    console.error('Get organizers error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/extras/organizers/:id
router.get('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers WHERE OrganizerId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    return res.json(results[0]);
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
    const result = await pool.query(`INSERT INTO Organizers (Name, Email, Phone, Address, OrganizerType, Description)
              VALUES (?, ?, ?, ?, ?, ?)`, [name, email || null, phone || null, address || null, organizerType, description || null]);
    const [inserted] = await pool.query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers WHERE OrganizerId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/organizers/:id
router.put('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    const { name, email, phone, address, organizerType, description } = req.body;
    await pool.query(`UPDATE Organizers
              SET Name = COALESCE(?, Name),
                  Email = COALESCE(?, Email),
                  Phone = COALESCE(?, Phone),
                  Address = COALESCE(?, Address),
                  OrganizerType = COALESCE(?, OrganizerType),
                  Description = COALESCE(?, Description)
              WHERE OrganizerId = ?`, [name || null, email || null, phone || null, address || null, organizerType || null, description || null, req.params.id]);
    const [updated] = await pool.query('SELECT OrganizerId, Name, Email, Phone, Address, OrganizerType, Description, CreatedAt FROM Organizers WHERE OrganizerId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/organizers/:id
router.delete('/organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT OrganizerId FROM Organizers WHERE OrganizerId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Organizer not found' });
    }
    await pool.query('DELETE FROM Organizers WHERE OrganizerId = ?', [req.params.id]);
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
    const [results] = await pool.query('SELECT DiscountId, Code, Description, Percentage, StartDate, EndDate, Status, CreatedAt FROM Discounts ORDER BY Code');
    return res.json(results);
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
    const result = await pool.query(`INSERT INTO Discounts (Code, Description, Percentage, StartDate, EndDate, Status)
              VALUES (?, ?, ?, ?, ?, 'Active')`, [code, description || null, percentage, startDate, endDate]);
    const [inserted] = await pool.query('SELECT DiscountId, Code, Description, Percentage, StartDate, EndDate, Status, CreatedAt FROM Discounts WHERE DiscountId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create discount error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/discounts/:id
router.put('/discounts/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT DiscountId FROM Discounts WHERE DiscountId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    const { description, percentage, status } = req.body;
    await pool.query(`UPDATE Discounts
              SET Description = COALESCE(?, Description),
                  Percentage = COALESCE(?, Percentage),
                  Status = COALESCE(?, Status)
              WHERE DiscountId = ?`, [description || null, percentage || null, status || null, req.params.id]);
    const [updated] = await pool.query('SELECT DiscountId, Code, Description, Percentage, StartDate, EndDate, Status, CreatedAt FROM Discounts WHERE DiscountId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update discount error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/discounts/:id
router.delete('/discounts/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT DiscountId FROM Discounts WHERE DiscountId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Discount not found' });
    }
    await pool.query('DELETE FROM Discounts WHERE DiscountId = ?', [req.params.id]);
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
    const params = [];
    
    if (req.query.eventId) {
      query += ' WHERE EventId = ?';
      params.push(req.query.eventId);
    }
    if (req.query.clientId) {
      if (req.query.eventId) {
        query += ' AND ClientId = ?';
      } else {
        query += ' WHERE ClientId = ?';
      }
      params.push(req.query.clientId);
    }
    query += ' ORDER BY RatingDate DESC';
    const [results] = await pool.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get ratings error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/extras/ratings/:id
router.get('/ratings/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT RatingId, EventId, ClientId, Rating, Comment, RatingDate FROM Ratings WHERE RatingId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get rating error', err);
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
    const result = await pool.query(`INSERT INTO Ratings (EventId, ClientId, Rating, Comment)
              VALUES (?, ?, ?, ?)`, [eventId, clientId, rating, comment || null]);
    const [inserted] = await pool.query('SELECT RatingId, EventId, ClientId, Rating, Comment, RatingDate FROM Ratings WHERE RatingId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create rating error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/extras/ratings/:id
router.put('/ratings/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT RatingId FROM Ratings WHERE RatingId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    const { rating, comment } = req.body;
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    await pool.query(`UPDATE Ratings 
              SET Rating = COALESCE(?, Rating),
                  Comment = COALESCE(?, Comment)
              WHERE RatingId = ?`, [rating, comment || null, req.params.id]);
    return res.json({ message: 'Rating updated successfully' });
  } catch (err) {
    console.error('Update rating error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/extras/ratings/:id
router.delete('/ratings/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT RatingId FROM Ratings WHERE RatingId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Rating not found' });
    }
    await pool.query('DELETE FROM Ratings WHERE RatingId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete rating error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
