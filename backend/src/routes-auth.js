import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from './db.js';
import { jwtConfig } from './config.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// Define admin email
const ADMIN_EMAIL = 'fastvip02@gmail.com';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  try {
    const db = await getDbPool();

    const existing = await db.get('SELECT Id FROM Users WHERE Email = ?', [email]);

    if (existing) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    
    // Split name into first and last name
    const nameParts = name.split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Account';

    // Check if this is the admin email
    const isAdmin = email === ADMIN_EMAIL ? 1 : 0;

    const result = await db.run(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash, IsAdmin, CreatedAt) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [firstName, lastName, email, hash, isAdmin]
    );

    const token = jwt.sign(
      {
        userId: result.lastID,
        name: firstName,
        email: email,
        isAdmin: isAdmin === 1
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.status(201).json({ message: 'User registered', token });
  } catch (err) {
    console.error('Register error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const db = await getDbPool();

    const user = await db.get(
      'SELECT Id, FirstName, Email, PasswordHash, IsAdmin FROM Users WHERE Email = ? LIMIT 1',
      [email]
    );

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        userId: user.Id,
        name: user.FirstName,
        email: user.Email,
        isAdmin: user.IsAdmin === 1
      },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return res.json({ token });
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/profile - Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const db = await getDbPool();
    const user = await db.get(
      'SELECT Id, FirstName, LastName, Email, IsAdmin, CreatedAt FROM Users WHERE Id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      userId: user.Id,
      name: `${user.FirstName} ${user.LastName}`,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      isAdmin: user.IsAdmin === 1,
      createdAt: user.CreatedAt
    });
  } catch (err) {
    console.error('Profile error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/auth/orders - Get user's orders/purchased tickets
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const db = await getDbPool();
    
    // Get user info first
    const user = await db.get(
      'SELECT Id, Email FROM Users WHERE Id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Try to find orders for this user
    // First try to find a client with matching email
    const client = await db.get(
      'SELECT ClientId FROM Clients WHERE Email = ?',
      [user.Email]
    );

    if (!client) {
      return res.json({ orders: [] });
    }

    // Get orders for this client
    const orders = await db.all(
      `SELECT o.OrderId, o.OrderDate, o.TotalAmount, o.Status,
              od.OrderDetailId, od.EventId, od.Quantity, od.UnitPrice,
              e.Title as EventTitle, e.Description, e.EventDate
       FROM Orders o
       LEFT JOIN OrderDetails od ON o.OrderId = od.OrderId
       LEFT JOIN Events e ON od.EventId = e.EventId
       WHERE o.ClientId = ?
       ORDER BY o.OrderDate DESC`,
      [client.ClientId]
    );

    if (!orders || orders.length === 0) {
      return res.json({ orders: [] });
    }

    // Group orders
    const groupedOrders = {};
    orders.forEach(order => {
      if (!groupedOrders[order.OrderId]) {
        groupedOrders[order.OrderId] = {
          orderId: order.OrderId,
          orderDate: order.OrderDate,
          totalAmount: order.TotalAmount,
          status: order.Status,
          tickets: []
        };
      }
      if (order.EventId) {
        groupedOrders[order.OrderId].tickets.push({
          eventId: order.EventId,
          eventTitle: order.EventTitle,
          eventDate: order.EventDate,
          quantity: order.Quantity,
          unitPrice: order.UnitPrice
        });
      }
    });

    return res.json({ orders: Object.values(groupedOrders) });
  } catch (err) {
    console.error('Orders error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
