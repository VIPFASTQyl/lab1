import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbPool } from './db.js';
import { jwtConfig } from './config.js';

const router = express.Router();

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

    await db.run(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash, CreatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [firstName, lastName, email, hash]
    );

    return res.status(201).json({ message: 'User registered' });
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
      'SELECT Id, FirstName, Email, PasswordHash FROM Users WHERE Email = ? LIMIT 1',
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
        email: user.Email
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

export default router;
