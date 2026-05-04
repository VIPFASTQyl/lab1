import express from 'express';
import { authMiddleware } from './middleware-auth.js';
import { getMySqlPool } from './mysql-db.js';

const router = express.Router();

const TABLES = {
  users: {
    tableName: 'Users',
    idColumn: 'Id',
    columns: ['Name', 'Email', 'PasswordHash', 'IsAdmin', 'ResetToken', 'ResetTokenExpiry', 'CreatedAt'],
    requiredOnCreate: ['Name', 'Email', 'PasswordHash']
  },
  venues: {
    tableName: 'Venues',
    idColumn: 'VenueId',
    columns: ['Name', 'Address', 'City', 'Capacity', 'Phone', 'Email', 'Description', 'CreatedAt'],
    requiredOnCreate: ['Name', 'Address', 'City', 'Capacity']
  },
  events: {
    tableName: 'Events',
    idColumn: 'EventId',
    columns: ['Title', 'Description', 'Category', 'EventDate', 'StartTime', 'EndTime', 'VenueId', 'Status', 'CreatedAt', 'UpdatedAt'],
    requiredOnCreate: ['Title', 'Category', 'EventDate', 'VenueId']
  },
  sectors: {
    tableName: 'Sectors',
    idColumn: 'SectorId',
    columns: ['VenueId', 'SectorName', 'Capacity', 'BasePrice', 'Description', 'CreatedAt'],
    requiredOnCreate: ['VenueId', 'SectorName', 'Capacity', 'BasePrice']
  },
  tickets: {
    tableName: 'Tickets',
    idColumn: 'TicketId',
    columns: ['EventId', 'SectorId', 'SeatNumber', 'Price', 'Status', 'TicketType', 'CreatedAt'],
    requiredOnCreate: ['EventId', 'SectorId', 'SeatNumber', 'Price']
  },
  clients: {
    tableName: 'Clients',
    idColumn: 'ClientId',
    columns: ['FirstName', 'LastName', 'Email', 'Phone', 'Address', 'RegistrationDate'],
    requiredOnCreate: ['FirstName', 'LastName', 'Email']
  },
  orders: {
    tableName: 'Orders',
    idColumn: 'OrderId',
    columns: ['ClientId', 'OrderDate', 'TotalAmount', 'Status', 'PaymentMethod', 'CreatedAt', 'UpdatedAt'],
    requiredOnCreate: ['ClientId']
  },
  'order-details': {
    tableName: 'OrderDetails',
    idColumn: 'DetailId',
    columns: ['OrderId', 'TicketId', 'Quantity', 'UnitPrice', 'TotalPrice'],
    requiredOnCreate: ['OrderId', 'TicketId', 'Quantity', 'UnitPrice', 'TotalPrice']
  },
  payments: {
    tableName: 'Payments',
    idColumn: 'PaymentId',
    columns: ['OrderId', 'PaymentDate', 'Amount', 'PaymentMethod', 'Status', 'Reference', 'CreatedAt'],
    requiredOnCreate: ['OrderId', 'Amount', 'PaymentMethod']
  },
  organizers: {
    tableName: 'Organizers',
    idColumn: 'OrganizerId',
    columns: ['Name', 'Email', 'Phone', 'Address', 'OrganizerType', 'Description', 'CreatedAt'],
    requiredOnCreate: ['Name', 'OrganizerType']
  },
  'event-organizers': {
    tableName: 'EventOrganizers',
    idColumn: 'EventOrganizerId',
    columns: ['EventId', 'OrganizerId', 'Role', 'Notes'],
    requiredOnCreate: ['EventId', 'OrganizerId']
  },
  discounts: {
    tableName: 'Discounts',
    idColumn: 'DiscountId',
    columns: ['Code', 'Description', 'Percentage', 'StartDate', 'EndDate', 'Status', 'CreatedAt'],
    requiredOnCreate: ['Code', 'Percentage', 'StartDate', 'EndDate']
  },
  ratings: {
    tableName: 'Ratings',
    idColumn: 'RatingId',
    columns: ['EventId', 'ClientId', 'Rating', 'Comment', 'RatingDate'],
    requiredOnCreate: ['EventId', 'ClientId', 'Rating']
  },
  partners: {
    tableName: 'Partners',
    idColumn: 'id',
    columns: ['name', 'logo_url', 'link', 'description', 'created_at'],
    requiredOnCreate: ['name']
  }
};

function toTicketTypeKey(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized.includes('vip')) return 'vip';
  if (normalized.includes('group')) return 'group';
  if (normalized.includes('standard') || normalized.includes('general')) return 'standard';
  return normalized.replace(/\s+/g, '-');
}

function toTicketTypeLabel(key) {
  if (key === 'vip') return 'VIP';
  if (key === 'group') return 'Group of 4';
  if (key === 'standard') return 'Standard';
  return key;
}

function normalizeBody(payload, allowedColumns) {
  const out = {};
  for (const column of allowedColumns) {
    if (Object.prototype.hasOwnProperty.call(payload, column)) {
      out[column] = payload[column];
    }
  }
  return out;
}

function validateRequired(payload, requiredFields) {
  const missing = requiredFields.filter((field) => {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) return true;
    const value = payload[field];
    return value === null || value === undefined || value === '';
  });

  return missing;
}

function getDefinition(resource) {
  return TABLES[resource] || null;
}

router.get('/health', async (req, res) => {
  try {
    const pool = getMySqlPool();
    await pool.query('SELECT 1 AS ok');
    res.json({ ok: true, engine: 'mysql' });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

router.get('/events-catalog', async (req, res) => {
  try {
    const pool = getMySqlPool();
    const [eventsRows] = await pool.query(
      `SELECT EventId, Title, Description, EventDate
       FROM Events
       ORDER BY EventDate ASC, EventId ASC`
    );

    const [ticketRows] = await pool.query(
      `SELECT EventId,
              TicketType,
              MIN(Price) AS Price,
              COUNT(*) AS Stock,
              SUM(CASE WHEN Status = 'Available' THEN 1 ELSE 0 END) AS Available
       FROM Tickets
       GROUP BY EventId, TicketType
       ORDER BY EventId ASC`
    );

    const eventsById = {};
    for (const row of eventsRows) {
      eventsById[row.EventId] = {
        name: row.Title,
        description: row.Description || '',
        eventDate: row.EventDate,
        ticketTypes: {}
      };
    }

    for (const row of ticketRows) {
      if (!eventsById[row.EventId]) continue;
      const key = toTicketTypeKey(row.TicketType);
      eventsById[row.EventId].ticketTypes[key] = {
        name: toTicketTypeLabel(key),
        price: Number(row.Price || 0),
        stock: Number(row.Stock || 0),
        available: Number(row.Available || 0)
      };
    }

    for (const id of Object.keys(eventsById)) {
      const ticketTypeValues = Object.values(eventsById[id].ticketTypes);
      eventsById[id].price = ticketTypeValues.length > 0
        ? Math.min(...ticketTypeValues.map((x) => Number(x.price || 0)))
        : 0;
      eventsById[id].zones = [];
    }

    res.json({ events: eventsById });
  } catch (error) {
    console.error('Failed to load events catalog:', error);
    res.status(500).json({ message: 'Failed to load events catalog', error: error.message });
  }
});

async function ensureVenue(pool, connection, preferredVenueId) {
  if (preferredVenueId) return preferredVenueId;

  const [venueRows] = await connection.query('SELECT VenueId FROM Venues ORDER BY VenueId ASC LIMIT 1');
  if (venueRows.length > 0) return venueRows[0].VenueId;

  const [insertVenue] = await connection.query(
    `INSERT INTO Venues (Name, Address, City, Capacity, Phone, Email, Description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Default Venue', 'Unknown Address', 'Unknown City', 1000, null, null, 'Auto-created for event catalog']
  );

  return insertVenue.insertId;
}

router.post('/events-catalog', authMiddleware, async (req, res) => {
  const { name, description, ticketTypes, venueId, eventDate } = req.body;
  if (!name || !ticketTypes || typeof ticketTypes !== 'object') {
    return res.status(400).json({ message: 'name and ticketTypes are required' });
  }

  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const finalVenueId = await ensureVenue(pool, connection, venueId);
    const [eventInsert] = await connection.query(
      `INSERT INTO Events (Title, Description, Category, EventDate, VenueId, Status)
       VALUES (?, ?, 'Festival', ?, ?, 'Upcoming')`,
      [name, description || '', eventDate || new Date().toISOString().slice(0, 10), finalVenueId]
    );

    const eventId = eventInsert.insertId;
    const sectorIdByType = {};

    for (const [key, data] of Object.entries(ticketTypes)) {
      const stock = Number(data.stock || 0);
      const price = Number(data.price || 0);
      if (stock <= 0 || price <= 0) continue;

      const [sectorInsert] = await connection.query(
        `INSERT INTO Sectors (VenueId, SectorName, Capacity, BasePrice, Description)
         VALUES (?, ?, ?, ?, ?)`,
        [finalVenueId, toTicketTypeLabel(key), stock, price, `Auto-created sector for ${toTicketTypeLabel(key)}`]
      );

      sectorIdByType[key] = sectorInsert.insertId;

      const ticketTypeName = toTicketTypeLabel(key);
      for (let i = 1; i <= stock; i += 1) {
        const seatNumber = `${ticketTypeName.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`;
        await connection.query(
          `INSERT INTO Tickets (EventId, SectorId, SeatNumber, Price, Status, TicketType)
           VALUES (?, ?, ?, ?, 'Available', ?)`,
          [eventId, sectorIdByType[key], seatNumber, price, ticketTypeName]
        );
      }
    }

    await connection.commit();
    res.status(201).json({ EventId: eventId });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to create catalog event:', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  } finally {
    connection.release();
  }
});

router.put('/events-catalog/:id', authMiddleware, async (req, res) => {
  const eventId = Number(req.params.id);
  const { name, description, ticketTypes } = req.body;

  if (!eventId) {
    return res.status(400).json({ message: 'Invalid event id' });
  }

  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    if (name || description !== undefined) {
      await connection.query(
        `UPDATE Events
         SET Title = COALESCE(?, Title),
             Description = COALESCE(?, Description),
             UpdatedAt = CURRENT_TIMESTAMP
         WHERE EventId = ?`,
        [name || null, description ?? null, eventId]
      );
    }

    if (ticketTypes && typeof ticketTypes === 'object') {
      for (const [key, data] of Object.entries(ticketTypes)) {
        const typeName = toTicketTypeLabel(key);
        const desiredStock = Number(data.stock || 0);
        const desiredPrice = Number(data.price || 0);

        const [existingRows] = await connection.query(
          `SELECT TicketId, Status, SectorId FROM Tickets WHERE EventId = ? AND TicketType = ? ORDER BY TicketId ASC`,
          [eventId, typeName]
        );

        const existingCount = existingRows.length;
        if (desiredPrice > 0) {
          await connection.query(
            `UPDATE Tickets
             SET Price = ?
             WHERE EventId = ? AND TicketType = ? AND Status = 'Available'`,
            [desiredPrice, eventId, typeName]
          );
        }

        if (desiredStock > existingCount) {
          let sectorId = existingRows[0]?.SectorId;
          if (!sectorId) {
            const [eventRows] = await connection.query('SELECT VenueId FROM Events WHERE EventId = ?', [eventId]);
            const venueId = eventRows[0]?.VenueId;
            if (!venueId) {
              throw new Error(`Missing venue for event ${eventId}`);
            }

            const [sectorInsert] = await connection.query(
              `INSERT INTO Sectors (VenueId, SectorName, Capacity, BasePrice, Description)
               VALUES (?, ?, ?, ?, ?)`,
              [venueId, typeName, desiredStock, desiredPrice || 0, `Auto-created sector for ${typeName}`]
            );
            sectorId = sectorInsert.insertId;
          }

          for (let i = existingCount + 1; i <= desiredStock; i += 1) {
            const seatNumber = `${typeName.slice(0, 3).toUpperCase()}-${String(i).padStart(4, '0')}`;
            await connection.query(
              `INSERT INTO Tickets (EventId, SectorId, SeatNumber, Price, Status, TicketType)
               VALUES (?, ?, ?, ?, 'Available', ?)`,
              [eventId, sectorId, seatNumber, desiredPrice || 0, typeName]
            );
          }
        }

        if (desiredStock < existingCount) {
          const toDelete = existingCount - desiredStock;
          await connection.query(
            `DELETE FROM Tickets
             WHERE EventId = ? AND TicketType = ? AND Status = 'Available'
             ORDER BY TicketId DESC
             LIMIT ?`,
            [eventId, typeName, toDelete]
          );
        }
      }
    }

    await connection.commit();
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to update catalog event:', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  } finally {
    connection.release();
  }
});

router.delete('/events-catalog/:id', authMiddleware, async (req, res) => {
  const eventId = Number(req.params.id);
  if (!eventId) {
    return res.status(400).json({ message: 'Invalid event id' });
  }

  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query('DELETE FROM Tickets WHERE EventId = ?', [eventId]);
    await connection.query('DELETE FROM Events WHERE EventId = ?', [eventId]);
    await connection.commit();
    res.status(204).send();
  } catch (error) {
    await connection.rollback();
    console.error('Failed to delete catalog event:', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  } finally {
    connection.release();
  }
});

router.post('/bookings', authMiddleware, async (req, res) => {
  const { eventId, ticketType, quantity } = req.body;
  const parsedEventId = Number(eventId);
  const parsedQuantity = Number(quantity);
  const finalType = toTicketTypeLabel(toTicketTypeKey(ticketType));

  if (!parsedEventId || !finalType || !parsedQuantity || parsedQuantity < 1) {
    return res.status(400).json({ message: 'eventId, ticketType and quantity are required' });
  }

  const pool = getMySqlPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [availableRows] = await connection.query(
      `SELECT TicketId
       FROM Tickets
       WHERE EventId = ? AND TicketType = ? AND Status = 'Available'
       ORDER BY TicketId ASC
       LIMIT ?`,
      [parsedEventId, finalType, parsedQuantity]
    );

    if (availableRows.length < parsedQuantity) {
      await connection.rollback();
      return res.status(409).json({
        message: `Only ${availableRows.length} ${finalType} tickets currently available`
      });
    }

    const ids = availableRows.map((row) => row.TicketId);
    await connection.query(
      `UPDATE Tickets
       SET Status = 'Sold'
       WHERE TicketId IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    await connection.commit();
    res.status(201).json({
      message: 'Booking completed',
      soldTicketIds: ids,
      soldCount: ids.length
    });
  } catch (error) {
    await connection.rollback();
    console.error('Failed to book tickets:', error);
    res.status(500).json({ message: 'Failed to book tickets', error: error.message });
  } finally {
    connection.release();
  }
});

router.get('/:resource', async (req, res) => {
  const definition = getDefinition(req.params.resource);
  if (!definition) {
    return res.status(404).json({ message: 'Unknown resource' });
  }

  try {
    const pool = getMySqlPool();
    const filterKeys = Object.keys(req.query).filter((key) => definition.columns.includes(key) || key === definition.idColumn);

    let sql = `SELECT * FROM \`${definition.tableName}\``;
    const values = [];
    if (filterKeys.length > 0) {
      sql += ' WHERE ' + filterKeys.map((key) => `${key} = ?`).join(' AND ');
      for (const key of filterKeys) {
        values.push(req.query[key]);
      }
    }
    try {
      const [cols] = await pool.query(`SHOW COLUMNS FROM \`${definition.tableName}\` LIKE ?`, [definition.idColumn]);
      if (cols && cols.length > 0) {
        sql += ` ORDER BY \`${definition.idColumn}\` DESC`;
      }
    } catch (err) {
      // If SHOW COLUMNS fails for any reason, skip ordering to avoid throwing
      console.warn(`Could not verify id column for ${definition.tableName}:`, err.message);
    }

    const [rows] = await pool.query(sql, values);
    res.json(rows);
  } catch (error) {
    console.error(`Failed to list ${req.params.resource}:`, error);
    res.status(500).json({ message: 'Database query failed', error: error.message });
  }
});

router.get('/:resource/:id', async (req, res) => {
  const definition = getDefinition(req.params.resource);
  if (!definition) {
    return res.status(404).json({ message: 'Unknown resource' });
  }

  try {
    const pool = getMySqlPool();
    const [rows] = await pool.query(
      `SELECT * FROM ${definition.tableName} WHERE ${definition.idColumn} = ? LIMIT 1`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(`Failed to fetch ${req.params.resource}:`, error);
    res.status(500).json({ message: 'Database query failed', error: error.message });
  }
});

router.post('/:resource', authMiddleware, async (req, res) => {
  const definition = getDefinition(req.params.resource);
  if (!definition) {
    return res.status(404).json({ message: 'Unknown resource' });
  }

  const body = normalizeBody(req.body, definition.columns);
  const missingFields = validateRequired(body, definition.requiredOnCreate);
  if (missingFields.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missingFields.join(', ')}` });
  }

  try {
    const pool = getMySqlPool();
    const keys = Object.keys(body);
    const values = Object.values(body);

    const [result] = await pool.query(
      `INSERT INTO ${definition.tableName} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
      values
    );

    const [rows] = await pool.query(
      `SELECT * FROM ${definition.tableName} WHERE ${definition.idColumn} = ? LIMIT 1`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(`Failed to create ${req.params.resource}:`, error);
    res.status(500).json({ message: 'Insert failed', error: error.message });
  }
});

router.put('/:resource/:id', authMiddleware, async (req, res) => {
  const definition = getDefinition(req.params.resource);
  if (!definition) {
    return res.status(404).json({ message: 'Unknown resource' });
  }

  const body = normalizeBody(req.body, definition.columns);
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ message: 'No valid fields provided to update' });
  }

  try {
    const pool = getMySqlPool();
    const [result] = await pool.query(
      `UPDATE ${definition.tableName}
       SET ${keys.map((key) => `${key} = ?`).join(', ')}
       WHERE ${definition.idColumn} = ?`,
      [...keys.map((key) => body[key]), req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM ${definition.tableName} WHERE ${definition.idColumn} = ? LIMIT 1`,
      [req.params.id]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error(`Failed to update ${req.params.resource}:`, error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
});

router.delete('/:resource/:id', authMiddleware, async (req, res) => {
  const definition = getDefinition(req.params.resource);
  if (!definition) {
    return res.status(404).json({ message: 'Unknown resource' });
  }

  try {
    const pool = getMySqlPool();
    const [result] = await pool.query(
      `DELETE FROM ${definition.tableName} WHERE ${definition.idColumn} = ?`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Record not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(`Failed to delete ${req.params.resource}:`, error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
});

export default router;
