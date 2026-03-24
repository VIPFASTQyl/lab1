import express from 'express';
import { getDbPool, sql } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

router.use(authMiddleware);

// ===== EVENT ORGANIZERS =====

// GET /api/relations/event-organizers?eventId=x&organizerId=x
router.get('/event-organizers', async (req, res) => {
  try {
    const pool = await getDbPool();
    let query = `SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers`;
    const request = pool.request();
    
    if (req.query.eventId) {
      request.input('eventId', sql.Int, req.query.eventId);
      query += ' WHERE EventId = @eventId';
    }
    if (req.query.organizerId) {
      if (req.query.eventId) {
        request.input('organizerId', sql.Int, req.query.organizerId);
        query += ' AND OrganizerId = @organizerId';
      } else {
        request.input('organizerId', sql.Int, req.query.organizerId);
        query += ' WHERE OrganizerId = @organizerId';
      }
    }
    query += ' ORDER BY EventId, Role';
    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (err) {
    console.error('Get event organizers error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/relations/event-organizers/:id
router.get('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const result = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers WHERE EventOrganizerId = @id');
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    return res.json(result.recordset[0]);
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
    const result = await pool
      .request()
      .input('eventId', sql.Int, eventId)
      .input('organizerId', sql.Int, organizerId)
      .input('role', sql.NVarChar, role || null)
      .input('notes', sql.NVarChar, notes || null)
      .query(`INSERT INTO EventOrganizers (EventId, OrganizerId, Role, Notes)
              OUTPUT INSERTED.*
              VALUES (@eventId, @organizerId, @role, @notes)`);
    return res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error('Create event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/relations/event-organizers/:id
router.put('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT EventOrganizerId FROM EventOrganizers WHERE EventOrganizerId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    const { role, notes } = req.body;
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .input('role', sql.NVarChar, role || null)
      .input('notes', sql.NVarChar, notes || null)
      .query(`UPDATE EventOrganizers
              SET Role = ISNULL(@role, Role),
                  Notes = ISNULL(@notes, Notes)
              WHERE EventOrganizerId = @id`);
    const updated = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT EventOrganizerId, EventId, OrganizerId, Role, Notes FROM EventOrganizers WHERE EventOrganizerId = @id');
    return res.json(updated.recordset[0]);
  } catch (err) {
    console.error('Update event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/relations/event-organizers/:id
router.delete('/event-organizers/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const existing = await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('SELECT EventOrganizerId FROM EventOrganizers WHERE EventOrganizerId = @id');
    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: 'Event organizer relationship not found' });
    }
    await pool
      .request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM EventOrganizers WHERE EventOrganizerId = @id');
    return res.status(204).send();
  } catch (err) {
    console.error('Delete event organizer error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
