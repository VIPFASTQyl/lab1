import express from 'express';
import { getDbPool, sql } from './db.js';
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
    const result = await pool.request()
      .query('SELECT * FROM Venues ORDER BY VenueId');
    res.json(result.recordset);
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
    const result = await pool.request()
      .input('VenueId', sql.Int, id)
      .query('SELECT * FROM Venues WHERE VenueId = @VenueId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.json(result.recordset[0]);
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

    const result = await pool.request()
      .input('Name', sql.NVarChar, Name)
      .input('Address', sql.NVarChar, Address)
      .input('City', sql.NVarChar, City)
      .input('Capacity', sql.Int, Capacity)
      .input('Phone', sql.NVarChar, Phone || null)
      .input('Email', sql.NVarChar, Email || null)
      .input('Description', sql.NVarChar, Description || null)
      .query(`INSERT INTO Venues (Name, Address, City, Capacity, Phone, Email, Description) 
              VALUES (@Name, @Address, @City, @Capacity, @Phone, @Email, @Description);
              SELECT SCOPE_IDENTITY() AS VenueId`);
    
    const venueId = result.recordset[0].VenueId;
    res.status(201).json({ VenueId: venueId, Name, Address, City, Capacity, Phone, Email, Description });
  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Error creating venue', error: error.message });
  }
});

// PUT update venue
router.put('/venues/:id', async (req, res) => {
  try {
    const pool = await getDbPool();
    const { id } = req.params;
    const { Name, Address, City, Capacity, Phone, Email, Description } = req.body;

    const result = await pool.request()
      .input('VenueId', sql.Int, id)
      .input('Name', sql.NVarChar, Name)
      .input('Address', sql.NVarChar, Address)
      .input('City', sql.NVarChar, City)
      .input('Capacity', sql.Int, Capacity)
      .input('Phone', sql.NVarChar, Phone)
      .input('Email', sql.NVarChar, Email)
      .input('Description', sql.NVarChar, Description)
      .query(`UPDATE Venues 
              SET Name = ISNULL(@Name, Name),
                  Address = ISNULL(@Address, Address),
                  City = ISNULL(@City, City),
                  Capacity = ISNULL(@Capacity, Capacity),
                  Phone = ISNULL(@Phone, Phone),
                  Email = ISNULL(@Email, Email),
                  Description = ISNULL(@Description, Description)
              WHERE VenueId = @VenueId`);

    if (result.rowsAffected[0] === 0) {
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
    const result = await pool.request()
      .input('VenueId', sql.Int, id)
      .query('DELETE FROM Venues WHERE VenueId = @VenueId');

    if (result.rowsAffected[0] === 0) {
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
    const request = pool.request();

    if (venueId) {
      query += ' WHERE VenueId = @VenueId';
      request.input('VenueId', sql.Int, venueId);
    }

    query += ' ORDER BY SectorId';
    const result = await request.query(query);
    res.json(result.recordset);
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
    const result = await pool.request()
      .input('SectorId', sql.Int, id)
      .query('SELECT * FROM Sectors WHERE SectorId = @SectorId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Sector not found' });
    }
    res.json(result.recordset[0]);
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

    const result = await pool.request()
      .input('VenueId', sql.Int, VenueId)
      .input('SectorName', sql.NVarChar, SectorName)
      .input('Capacity', sql.Int, Capacity)
      .input('BasePrice', sql.Decimal(10, 2), BasePrice)
      .input('Description', sql.NVarChar, Description || null)
      .query(`INSERT INTO Sectors (VenueId, SectorName, Capacity, BasePrice, Description) 
              VALUES (@VenueId, @SectorName, @Capacity, @BasePrice, @Description);
              SELECT SCOPE_IDENTITY() AS SectorId`);
    
    const sectorId = result.recordset[0].SectorId;
    res.status(201).json({ SectorId: sectorId, VenueId, SectorName, Capacity, BasePrice, Description });
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

    const result = await pool.request()
      .input('SectorId', sql.Int, id)
      .input('SectorName', sql.NVarChar, SectorName)
      .input('Capacity', sql.Int, Capacity)
      .input('BasePrice', sql.Decimal(10, 2), BasePrice)
      .input('Description', sql.NVarChar, Description)
      .query(`UPDATE Sectors 
              SET SectorName = ISNULL(@SectorName, SectorName),
                  Capacity = ISNULL(@Capacity, Capacity),
                  BasePrice = ISNULL(@BasePrice, BasePrice),
                  Description = ISNULL(@Description, Description)
              WHERE SectorId = @SectorId`);

    if (result.rowsAffected[0] === 0) {
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
    const result = await pool.request()
      .input('SectorId', sql.Int, id)
      .query('DELETE FROM Sectors WHERE SectorId = @SectorId');

    if (result.rowsAffected[0] === 0) {
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
    const result = await pool.request()
      .query('SELECT * FROM Events ORDER BY EventDate DESC');
    res.json(result.recordset);
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
    const result = await pool.request()
      .input('EventId', sql.Int, id)
      .query('SELECT * FROM Events WHERE EventId = @EventId');
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(result.recordset[0]);
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

    const result = await pool.request()
      .input('Title', sql.NVarChar, Title)
      .input('Description', sql.NVarChar, Description || null)
      .input('Category', sql.NVarChar, Category)
      .input('EventDate', sql.DateTime2, EventDate)
      .input('StartTime', sql.Time, StartTime || null)
      .input('EndTime', sql.Time, EndTime || null)
      .input('VenueId', sql.Int, VenueId)
      .input('Status', sql.NVarChar, Status || 'Active')
      .query(`INSERT INTO Events (Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status, CreatedAt, UpdatedAt) 
              VALUES (@Title, @Description, @Category, @EventDate, @StartTime, @EndTime, @VenueId, @Status, GETDATE(), GETDATE());
              SELECT SCOPE_IDENTITY() AS EventId`);
    
    const eventId = result.recordset[0].EventId;
    res.status(201).json({ EventId: eventId, Title, Description, Category, EventDate, StartTime, EndTime, VenueId, Status });
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

    const result = await pool.request()
      .input('EventId', sql.Int, id)
      .input('Title', sql.NVarChar, Title)
      .input('Description', sql.NVarChar, Description)
      .input('Category', sql.NVarChar, Category)
      .input('EventDate', sql.DateTime2, EventDate)
      .input('StartTime', sql.Time, StartTime)
      .input('EndTime', sql.Time, EndTime)
      .input('VenueId', sql.Int, VenueId)
      .input('Status', sql.NVarChar, Status)
      .query(`UPDATE Events 
              SET Title = ISNULL(@Title, Title),
                  Description = ISNULL(@Description, Description),
                  Category = ISNULL(@Category, Category),
                  EventDate = ISNULL(@EventDate, EventDate),
                  StartTime = ISNULL(@StartTime, StartTime),
                  EndTime = ISNULL(@EndTime, EndTime),
                  VenueId = ISNULL(@VenueId, VenueId),
                  Status = ISNULL(@Status, Status),
                  UpdatedAt = GETDATE()
              WHERE EventId = @EventId`);

    if (result.rowsAffected[0] === 0) {
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
    const result = await pool.request()
      .input('EventId', sql.Int, id)
      .query('DELETE FROM Events WHERE EventId = @EventId');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

export default router;
