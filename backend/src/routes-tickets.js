import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const db = await getDbPool();
    const results = await db.all('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets ORDER BY CreatedAt DESC');
    return res.json(results);
  } catch (err) {
    console.error('Get tickets error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbPool();
    const results = await db.all('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets WHERE Id = ?', [id]);

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    return res.json(results[0]);
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
    const db = await getDbPool();
    const result = await db.run('INSERT INTO Tickets (Title, Description, Status, Priority, CreatedAt, UpdatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)', [title, description || '', status, priority]);
    const inserted = await db.all('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets WHERE Id = ?', [result.lastID]);

    return res.status(201).json(inserted[0]);
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
    const db = await getDbPool();

    const existing = await db.all('SELECT Id FROM Tickets WHERE Id = ?', [id]);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await db.run(`UPDATE Tickets
              SET Title = COALESCE(?, Title),
                  Description = COALESCE(?, Description),
                  Status = COALESCE(?, Status),
                  Priority = COALESCE(?, Priority),
                  UpdatedAt = CURRENT_TIMESTAMP
              WHERE Id = ?`, [title || null, description || null, status || null, priority || null, id]);

    const updated = await db.all('SELECT Id, Title, Description, Status, Priority, CreatedAt, UpdatedAt FROM Tickets WHERE Id = ?', [id]);

    return res.json(updated[0]);
  } catch (err) {
    console.error('Update ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/tickets/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbPool();

    const existing = await db.all('SELECT Id FROM Tickets WHERE Id = ?', [id]);

    if (!existing || existing.length === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await db.run('DELETE FROM Tickets WHERE Id = ?', [id]);

    return res.status(204).send();
  } catch (err) {
    console.error('Delete ticket error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
