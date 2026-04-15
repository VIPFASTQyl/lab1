import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { getDbPool } from './db.js';
import { jwtConfig } from './config.js';
import { authMiddleware } from './middleware-auth.js';

const router = express.Router();

// Define admin email
const ADMIN_EMAIL = 'admin@ticketapp.com';

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

// Verify email transporter (optional, logs if credentials are invalid)
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not configured. Password reset emails will not be sent.');
    console.log('To enable email: Set EMAIL_USER and EMAIL_PASSWORD in .env file');
  } else {
    console.log('✅ Email service ready');
  }
});

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

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const db = await getDbPool();
    const user = await db.get('SELECT Id, Email, FirstName FROM Users WHERE Email = ?', [email]);

    if (!user) {
      // Don't reveal if email exists (security best practice)
      return res.status(200).json({ message: 'If email exists, reset link will be sent' });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store reset token in database
    await db.run(
      'UPDATE Users SET ResetToken = ?, ResetTokenExpiry = ? WHERE Id = ?',
      [resetToken, resetTokenExpiry.toISOString(), user.Id]
    );

    // Create reset link
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}`;
    
    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'your-email@gmail.com',
        to: email,
        subject: 'Password Reset Request - Madverse TicketApp',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #1a1a2e; color: white; padding: 20px; text-align: center; border-radius: 8px;">
              <h2>Madverse TicketApp</h2>
              <p style="font-size: 14px; color: #999;">Password Reset Request</p>
            </div>
            
            <div style="padding: 30px; background-color: #f5f5f5;">
              <p>Hi ${user.FirstName},</p>
              
              <p>We received a request to reset the password for your account. If you didn't make this request, you can ignore this email.</p>
              
              <p>To reset your password, click the button below:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #a855f7; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  Reset Password
                </a>
              </div>
              
              <p style="font-size: 12px; color: #666;">
                Or copy and paste this link in your browser:<br>
                <code style="background-color: #e0e0e0; padding: 5px 10px; border-radius: 3px; word-break: break-all;">
                  ${resetLink}
                </code>
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                This link will expire in 1 hour.<br>
                If you didn't request this, please ignore this email and your password will remain unchanged.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #ddd;">
              <p>© 2026 Madverse TicketApp. All rights reserved.</p>
            </div>
          </div>
        `
      });
      
      console.log(`✅ Password reset email sent to ${email}`);
    } catch (mailErr) {
      console.error('⚠️  Failed to send email:', mailErr.message);
      console.log(`Reset link (fallback): ${resetLink}`);
      // Even if email fails, the reset link is stored in DB and can be used
    }
    
    return res.status(200).json({ 
      message: 'If email exists, password reset link has been sent'
    });
  } catch (err) {
    console.error('Forgot password error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  try {
    const db = await getDbPool();
    
    // Find user with valid reset token
    const user = await db.get(
      'SELECT Id, Email FROM Users WHERE ResetToken = ? AND ResetTokenExpiry > ?',
      [token, new Date().toISOString()]
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    await db.run(
      'UPDATE Users SET PasswordHash = ?, ResetToken = NULL, ResetTokenExpiry = NULL WHERE Id = ?',
      [hash, user.Id]
    );

    return res.status(200).json({ message: 'Password reset successful. Please log in with your new password.' });
  } catch (err) {
    console.error('Reset password error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/auth/verify-reset-token - Verify if reset token is valid
router.post('/verify-reset-token', async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const db = await getDbPool();
    const user = await db.get(
      'SELECT Id FROM Users WHERE ResetToken = ? AND ResetTokenExpiry > ?',
      [token, new Date().toISOString()]
    );

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    return res.status(200).json({ valid: true });
  } catch (err) {
    console.error('Verify token error', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
