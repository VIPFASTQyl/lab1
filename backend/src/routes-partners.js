import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// Public route for fetching partners
router.get('/', async (req, res) => {
  try {
    const db = await getDbPool();
    const partners = await db.all('SELECT * FROM Partners ORDER BY id DESC');
    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Error fetching partners', error: error.message });
  }
});

// All routes below require authentication and admin privileges
router.use(authMiddleware);

// Middleware to check if user isAdmin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin === 1) {
    next();
  } else {
    // some systems use true/false or 1/0
    if (req.user && (req.user.IsAdmin === 1 || req.user.IsAdmin === true || req.user.isAdmin === true || req.user.isAdmin === 1)) {
        next();
    } else {
        return res.status(403).json({ message: 'Forbidden: Admin access required.' });
    }
  }
};

router.use(isAdmin);

// GET partner by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDbPool();
    const { id } = req.params;
    const results = await db.all('SELECT * FROM Partners WHERE id = ?', [id]);
    
    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ message: 'Error fetching partner', error: error.message });
  }
});

// POST create new partner
router.post('/', async (req, res) => {
  try {
    const db = await getDbPool();
    const { name, logo_url, link, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'name is required' });
    }

    const result = await db.run(
      'INSERT INTO Partners (name, logo_url, link, description) VALUES (?, ?, ?, ?)',
      [name, logo_url || null, link || null, description || null]
    );
    
    res.status(201).json({ id: result.lastID, name, logo_url, link, description });
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Error creating partner', error: error.message });
  }
});

// PUT update partner
router.put('/:id', async (req, res) => {
  try {
    const db = await getDbPool();
    const { id } = req.params;
    const { name, logo_url, link, description } = req.body;

    const result = await db.run(
      'UPDATE Partners SET name = ?, logo_url = ?, link = ?, description = ? WHERE id = ?',
      [name, logo_url || null, link || null, description || null, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.json({ message: 'Partner updated successfully' });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ message: 'Error updating partner', error: error.message });
  }
});

// DELETE partner
router.delete('/:id', async (req, res) => {
  try {
    const db = await getDbPool();
    const { id } = req.params;
    const result = await db.run('DELETE FROM Partners WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ message: 'Error deleting partner', error: error.message });
  }
});

export default router;