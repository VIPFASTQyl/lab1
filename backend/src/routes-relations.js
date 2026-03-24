import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// ===== EVENT ORGANIZERS =====

// GET /api/relations/event-organizers?eventId=x&organizerId=x
router.get('/event-organizers', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers`;
    const params = [];
    
    if (req.query.eventId) {
      query += ' WHERE EventId = ?';
      params.push(req.query.eventId);
    }
    if (req.query.organizerId) {
      if (req.query.eventId) {
        query += ' AND OrganizerId = ?';
      } else {
        query += ' WHERE OrganizerId = ?';
      }
      params.push(req.query.organizerId);
    }
    query += ' ORDER BY EventId, Role';
    const [results] = await pool.query(query, params);
    return res.json(results);
  } catch (err) {
    console.error('Get event organizers error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/relations/event-organizers/:id
router.get('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [results] = await pool.query('SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers WHERE EventOrganizerId = ?', [req.params.id]);
    if (results.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error('Get event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/relations/event-organizers
router.post('/event-organizers', async (req, res) => {
  const { eventId, organizerId, role, notes } = req.body;
  if (!eventId || !organizerId) {
    return res.status(400).json({ message: 'EventId and OrganizerId are required' });
  }
  try {
    const pool = await getDbPool();
    const result = await pool.query(`INSERT INTO EventOrganizers (EventId, OrganizerId, Role, Notes)
              VALUES (?, ?, ?, ?)`, [eventId, organizerId, role || null, notes || null]);
    const [inserted] = await pool.query('SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers WHERE EventOrganizerId = ?', [result.insertId]);
    return res.status(201).json(inserted[0]);
  } catch (err) {
    console.error('Create event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/relations/event-organizers/:id
router.put('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT EventOrganizerId FROM EventOrganizers WHERE EventOrganizerId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    const { role, notes } = req.body;
    await pool.query(`UPDATE EventOrganizers
              SET Role = COALESCE(?, Role),
                  Notes = COALESCE(?, Notes)
              WHERE EventOrganizerId = ?`, [role || null, notes || null, req.params.id]);
    const [updated] = await pool.query('SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers WHERE EventOrganizerId = ?', [req.params.id]);
    return res.json(updated[0]);
  } catch (err) {
    console.error('Update event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/relations/event-organizers/:id
router.delete('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [existing] = await pool.query('SELECT EventOrganizerId FROM EventOrganizers WHERE EventOrganizerId = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    await pool.query('DELETE FROM EventOrganizers WHERE EventOrganizerId = ?', [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error('Delete event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
