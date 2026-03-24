import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// ===========================
// VENUES ENDPOINTS
// ===========================

// GET all venues
router.get('/venues', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [venues] = await pool.query('SELECT * FROM Venues ORDER BY VenueId');
    res.json(venues);
  } catch (error) {
    console.error('Error fetching venues:', error);
    res.status(500).json({ message: 'Error fetching venues', error: error.message });
  }
});

// GET venue by ID
router.get('/venues/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM Venues WHERE VenueId = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching venue:', error);
    res.status(500).json({ message: 'Error fetching venue', error: error.message });
  }
});

// POST create new venue
router.post('/venues', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { Name, Address, City, Capacity, Phone, Email, Description } = req.body;
    
    if (!Name || !Address || !City || !Capacity) {
      return res.status(400).json({ message: 'Name, Address, City, and Capacity are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO Venues (Name, Address, City, Capacity, Phone, Email, Description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Name, Address, City, Capacity, Phone || null, Email || null, Description || null]
    );
    
    res.status(201).json({ VenueId: result.insertId, Name, Address, City, Capacity, Phone, Email, Description });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Error creating venue',error: error.message });
  }
});

// PUT update venue
router.put('/venues/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const { Name, Address, City, Capacity, Phone, Email, Description } = req.body;

    const [result] = await pool.query(
      'UPDATE Venues SET Name = ?, Address = ?, City = ?, Capacity = ?, Phone = ?, Email = ?, Description = ? WHERE VenueId = ?',
      [Name, Address, City, Capacity, Phone, Email, Description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json({ message: 'Venue updated successfully' });
  } catch (error) {
    console.error('Error updating venue:', error);
    res.status(500).json({ message: 'Error updating venue', error: error.message });
  }
});

// DELETE venue
router.delete('/venues/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Venues WHERE VenueId = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting venue:', error);
    res.status(500).json({ message: 'Error deleting venue', error: error.message });
  }
});

// ===========================
// SECTORS ENDPOINTS
// ===========================

// GET all sectors (with optional venueId filter)
router.get('/sectors', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { venueId } = req.query;
    
    let query = 'SELECT * FROM Sectors';
    let params = [];

    if (venueId) {
      query += ' WHERE VenueId = ?';
      params.push(venueId);
    }

    query += ' ORDER BY SectorId';
    const [sectors] = await pool.query(query, params);
    res.json(sectors);
  } catch (error) {
    console.error('Error fetching sectors:', error);
    res.status(500).json({ message: 'Error fetching sectors', error: error.message });
  }
});

// GET sector by ID
router.get('/sectors/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM Sectors WHERE SectorId = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching sector:', error);
    res.status(500).json({ message: 'Error fetching sector', error: error.message });
  }
});

// POST create new sector
router.post('/sectors', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { VenueId, SectorName, Capacity, BasePrice, Description } = req.body;
    
    if (!VenueId || !SectorName || !Capacity || BasePrice === undefined) {
      return res.status(400).json({ message: 'VenueId, SectorName, Capacity, and BasePrice are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO Sectors (VenueId, SectorName, Capacity, BasePrice, Description) VALUES (?, ?, ?, ?, ?)',
      [VenueId, SectorName, Capacity, BasePrice, Description || null]
    );
    
    res.status(201).json({ SectorId: result.insertId, VenueId, SectorName, Capacity, BasePrice, Description });
  } catch (error) {
    console.error('Error creating sector:', error);
    res.status(500).json({ message: 'Error creating sector', error: error.message });
  }
});

// PUT update sector
router.put('/sectors/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const { SectorName, Capacity, BasePrice, Description } = req.body;

    const [result] = await pool.query(
      'UPDATE Sectors SET SectorName = ?, Capacity = ?, BasePrice = ?, Description = ? WHERE SectorId = ?',
      [SectorName, Capacity, BasePrice, Description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }
    res.json({ message: 'Sector updated successfully' });
  } catch (error) {
    console.error('Error updating sector:', error);
    res.status(500).json({ message: 'Error updating sector', error: error.message });
  }
});

// DELETE sector
router.delete('/sectors/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Sectors WHERE SectorId = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting sector:', error);
    res.status(500).json({ message: 'Error deleting sector', error: error.message });
  }
});

// ===========================
// EVENTS ENDPOINTS
// ===========================

// GET all events
router.get('/events', async (req, res) => {
  try {
    const pool = await getDbPool();
    const [events] = await pool.query('SELECT * FROM Events ORDER BY EventDate DESC');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// GET event by ID
router.get('/events/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [results] = await pool.query('SELECT * FROM Events WHERE EventId = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(results[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// POST create new event
router.post('/events', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status } = req.body;
    
    if (!Title || !Category || !EventDate || !VenueId) {
      return res.status(400).json({ message: 'Title, Category, EventDate, and VenueId are required' });
    }

    const [result] = await pool.query(
      'INSERT INTO Events (Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [Title, Description || null, Category, EventDate, StartTime || null, EndTime || null, VenueId, Status || 'Upcoming']
    );
    
    res.status(201).json({ EventId: result.insertId, Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// PUT update event
router.put('/events/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const { Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status } = req.body;

    const [result] = await pool.query(
      'UPDATE Events SET Title = ?, Description = ?, Category = ?, EventDate = ?, StartTime = ?, EndTime = ?, VenueId = ?, Status = ? WHERE EventId = ?',
      [Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// DELETE event
router.delete('/events/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM Events WHERE EventId = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

export default router;
