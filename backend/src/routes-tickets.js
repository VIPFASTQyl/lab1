import express from 'express';
import { getDbPool, sql } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .query('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets ORDER BY CreatedAt DESC');
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get tickets error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets WHERE Id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json(result.recordset[0]);
  } catch (err) {
    console.error('Get ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/tickets
router.post('/', async (req, res) => {
  const { title, description, status = 'Open', priority = 'Normal' } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('title', sql.NVarChar, title)
      .input('description', sql.NVarChar, description || '')
      .input('status', sql.NVarChar, status)
      .input('priority', sql.NVarChar, priority)
      .query('INSERT INTO Tickets (Title, Description, Status, Priority, CreatedAt, UpdatedAt) OUTPUT INSERTED.* VALUES (@title, @description, @status, @priority, GETUTCDATE(), GETUTCDATE())');

    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/tickets/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority } = req.body;

  try {
    const pool = await getDbPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT Id FROM Tickets WHERE Id = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .input('title', sql.NVarChar, title || null)
      .input('description', sql.NVarChar, description || null)
      .input('status', sql.NVarChar, status || null)
      .input('priority', sql.NVarChar, priority || null)
      .query(`UPDATE Tickets
              SET Title = ISNULL(@title, Title),
                  Description = ISNULL(@description, Description),
                  Status = ISNULL(@status, Status),
                  Priority = ISNULL(@priority, Priority),
                  UpdatedAt = GETUTCDATE()
              WHERE Id = @id`);

    const updated = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets WHERE Id = @id');

    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/tickets/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await getDbPool();

    const existing = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT Id FROM Tickets WHERE Id = @id');

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Tickets WHERE Id = @id');

    return res.status(204).send();
  } catch (err) {
    console.error('Delete ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
