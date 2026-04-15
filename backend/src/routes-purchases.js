import express from 'express';
import { getDbPool } from './db.js';
import { authMiddleware } from './middleware-auth.js';
import nodemailer from 'nodemailer';
import { emailConfig } from './config.js';
import QRCode from 'qrcode';
import crypto from 'crypto';
import { generateTicketsPDF, generateOneTimeToken } from './pdf-generator.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PDFDir = path.join(__dirname, '../tickets-pdf');

// Ensure PDF directory exists
if (!fs.existsSync(PDFDir)) {
  fs.mkdirSync(PDFDir, { recursive: true });
}

const router = express.Router();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailConfig.emailUser,
    pass: emailConfig.emailPassword
  }
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.log('⚠️  Email service not fully configured yet.');
  } else {
    console.log('✅ Email service is ready to send tickets!');
  }
});

const sender = {
  name: 'Madverse',
  email: 'noreply@madverse.com'
};

// Generate unique ticket code
function generateTicketCode() {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

// POST /api/purchases - Create ticket purchase
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { eventId, eventTitle, ticketType, quantity, email, name } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!eventId || !ticketType || !quantity || quantity < 1) {
      return res.status(400).json({ message: 'Invalid ticket information' });
    }

    const db = await getDbPool();
    const tickets = [];

    // Create tickets with unique QR codes and one-time-use tokens
    for (let i = 0; i < quantity; i++) {
      const ticketCode = generateTicketCode();
      const oneTimeToken = generateOneTimeToken(); // One-time use token
      
      const qrCodeUrl = await QRCode.toDataURL(ticketCode);

      tickets.push({
        ticketNumber: i + 1,
        ticketCode,
        oneTimeToken,
        qrCodeUrl,
        eventTitle,
        ticketType,
        holderName: name || req.user.name,
        purchased: new Date().toISOString(),
        used: false
      });
    }

    // Generate PDF with all tickets
    let pdfPath = null;
    let purchaseId = null;
    try {
      purchaseId = crypto.randomBytes(4).toString('hex');
      const pdfFilename = `ticket-${purchaseId}-${Date.now()}.pdf`;
      pdfPath = path.join(PDFDir, pdfFilename);
      
      const pdfDoc = await generateTicketsPDF(
        tickets.map(t => ({
          ticketCode: t.ticketCode,
          oneTimeToken: t.oneTimeToken,
          ticketType: t.ticketType,
          eventTitle: t.eventTitle,
          holderName: t.holderName
        })),
        eventTitle,
        name || req.user.name
      );

      // Save PDF to file
      await new Promise((resolve, reject) => {
        pdfDoc.pipe(fs.createWriteStream(pdfPath));
        pdfDoc.on('end', resolve);
        pdfDoc.on('error', reject);
        pdfDoc.end();
      });

      console.log('✅ PDF generated:', pdfPath);
    } catch (pdfError) {
      console.log('⚠️  PDF generation failed:', pdfError.message);
      purchaseId = purchaseId || crypto.randomBytes(4).toString('hex');
    }

    // Send email confirmation with professional ticket design
    const ticketHtml = tickets
      .map(
        (ticket, idx) =>
          `
      <div style="
        width: 100%;
        max-width: 350px;
        margin: 20px auto;
        background: linear-gradient(135deg, #c41e3a 0%, #8b1530 100%);
        border-radius: 15px;
        padding: 0;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
        overflow: hidden;
      ">
        <!-- Header -->
        <div style="background: #000; color: #fff; padding: 15px; font-size: 12px; font-weight: bold;">
          KEEP ME SAFE! I AM YOUR TICKET!
        </div>
        
        <!-- Ticket Content -->
        <div style="padding: 30px 20px; color: white;">
          <!-- QR Code Container -->
          <div style="
            background: white;
            padding: 15px;
            border-radius: 10px;
            display: inline-block;
            margin-bottom: 20px;
          ">
            <img src="${ticket.qrCodeUrl}" alt="QR Code" style="width: 150px; height: 150px; display: block;" />
          </div>
          
          <!-- Ticket Type -->
          <h2 style="margin: 15px 0 5px; font-size: 24px; font-weight: bold; color: white;">
            ${ticket.ticketType}
          </h2>
          
          <!-- Ticket Code -->
          <p style="margin: 0 0 20px; font-size: 18px; font-weight: bold; color: #fff;">
            ${ticket.ticketCode}
          </p>
          
          <!-- Event Title -->
          <h3 style="margin: 15px 0; font-size: 16px; font-weight: bold; color: white;">
            ${ticket.eventTitle}
          </h3>
          
          <!-- Ticket Holder -->
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.3);">
            <p style="margin: 5px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
              Ticket Holder
            </p>
            <p style="margin: 5px 0; font-size: 14px; font-weight: bold;">
              ${name || req.user.name}
            </p>
          </div>
        </div>
      </div>
      `
      )
      .join('');

    try {
      await transporter.sendMail({
        from: `"Madverse Tickets" <${emailConfig.emailUser}>`,
        to: email || req.user.email,
        subject: `🎫 Your Tickets for ${eventTitle}! - Madverse`,
        html: `
          <div style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
              
              <!-- Logo/Header -->
              <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #c41e3a; padding-bottom: 20px;">
                <h1 style="margin: 0; color: #c41e3a; font-size: 28px;">🎫 MADVERSE</h1>
                <p style="margin: 5px 0 0; color: #666; font-size: 14px;">Your Ticket Awaits!</p>
              </div>
              
              <!-- Main Message -->
              <h2 style="color: #333; margin-top: 0;">Hey ${name || req.user.name}! 🎉</h2>
              <p style="color: #666; line-height: 1.6; font-size: 14px;">
                Great news! You have successfully purchased <strong>${quantity} ticket(s)</strong> for:
              </p>
              
              <div style="background: #f0f0f0; padding: 15px; border-left: 4px solid #c41e3a; margin: 20px 0; border-radius: 5px;">
                <h3 style="margin: 0; color: #c41e3a; font-size: 18px;">${eventTitle}</h3>
              </div>
              
              <!-- Tickets -->
              <p style="color: #666; font-weight: bold; margin: 30px 0 15px; text-align: center;">
                Your Ticket${quantity > 1 ? 's' : ''}:
              </p>
              
              ${ticketHtml}
              
              <!-- Important Instructions -->
              <div style="background: #e3f2fd; border: 1px solid #2196F3; border-radius: 8px; padding: 20px; margin: 30px 0;">
                <h3 style="margin-top: 0; color: #1976D2;">📋 Important Instructions:</h3>
                <ul style="margin: 10px 0; padding-left: 20px; color: #333; font-size: 14px;">
                  <li style="margin: 8px 0;"><strong>Screenshot</strong> or save your QR code</li>
                  <li style="margin: 8px 0;"><strong>Show at entrance</strong> - Staff will scan for check-in</li>
                  <li style="margin: 8px 0;"><strong>ONE QR = ONE ENTRY</strong> - Don't share your codes</li>
                  <li style="margin: 8px 0;"><strong>Arrive early</strong> - Avoid long queues</li>
                </ul>
              </div>

              <!-- Download PDF Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5000/api/purchases/download/${purchaseId}" 
                   style="
                     display: inline-block;
                     background: linear-gradient(135deg, #c41e3a 0%, #8b1530 100%);
                     color: white;
                     padding: 15px 40px;
                     text-decoration: none;
                     border-radius: 8px;
                     font-weight: bold;
                     font-size: 16px;
                     margin: 10px 0;
                     box-shadow: 0 4px 15px rgba(196, 30, 58, 0.4);
                   ">
                  📥 Download PDF Ticket
                </a>
                <p style="color: #666; font-size: 13px; margin: 10px 0;">Click to download your ticket as PDF</p>
              </div>
              
              <!-- Support -->
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
                <p style="margin: 5px 0;">Need help? Contact us at <strong>support@madverse.com</strong></p>
                <p style="margin: 5px 0;">© 2026 Madverse TicketApp. All rights reserved.</p>
              </div>
              
            </div>
          </div>
        `
      });
      
      console.log('✅ Email sent successfully to:', email || req.user.email);
    } catch (emailError) {
      console.log('⚠️  Email could not be sent');
      console.log('Error:', emailError.message);
      // Don't fail the purchase if email fails - still allow the ticket creation
    }

    // Store tickets in database for one-time token validation and tracking
    try {
      for (const ticket of tickets) {
        await db.run(
          `INSERT INTO PurchasedTickets (
            purchaseId, 
            ticketCode, 
            oneTimeToken, 
            ticketType, 
            eventTitle, 
            holderName, 
            purchaserEmail
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            purchaseId,
            ticket.ticketCode,
            ticket.oneTimeToken,
            ticket.ticketType,
            eventTitle,
            ticket.holderName,
            email || req.user.email
          ]
        );
      }
      console.log(`✅ Stored ${tickets.length} tickets in database for one-time token tracking`);
    } catch (dbError) {
      console.log('⚠️  Database storage error:', dbError.message);
      // Don't fail the purchase if database storage fails
    }

    res.status(201).json({
      success: true,
      message: 'Tickets purchased successfully!',
      purchaseId: purchaseId,
      eventTitle: eventTitle,
      ticketCount: quantity,
      purchaserEmail: email || req.user.email,
      purchaserName: name || req.user.name,
      tickets: tickets.map((ticket, idx) => ({
        ticketNumber: idx + 1,
        ticketCode: ticket.ticketCode,
        ticketType: ticket.ticketType,
        eventTitle: ticket.eventTitle,
        qrCode: ticket.qrCodeUrl,
        purchasedAt: new Date().toISOString(),
        instructions: [
          '📱 Screenshot or save this QR code',
          '🎫 Show this code at the event entrance',
          '✅ Staff will scan it for check-in',
          '🔐 Keep this code safe - never share it'
        ]
      })),
      nextSteps: {
        step1: 'Save your QR codes',
        step2: 'Check your email for confirmation (if configured)',
        step3: 'Arrive at the event and show your QR code at entrance',
        dashboard: 'View all your tickets anytime in your Madverse Dashboard'
      }
    });
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ message: 'Failed to process purchase', error: error.message });
  }
});

// POST /api/purchases/scan - Scan ticket QR code with one-time token validation
router.post('/scan', async (req, res) => {
  try {
    const { oneTimeToken, scannedBy } = req.body;

    if (!oneTimeToken) {
      return res.status(400).json({ 
        success: false,
        message: 'Token is required for ticket validation',
        status: 'error'
      });
    }

    const db = await getDbPool();

    // Find the ticket by its one-time token
    const ticket = await db.get(
      `SELECT * FROM PurchasedTickets WHERE oneTimeToken = ?`,
      [oneTimeToken]
    );

    // Token not found in database
    if (!ticket) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid ticket token. Ticket not found in system.',
        status: 'invalid'
      });
    }

    // Token has already been used
    if (ticket.used) {
      return res.status(409).json({ 
        success: false,
        message: `This ticket was already scanned on ${new Date(ticket.scannedAt).toLocaleString()}. One-time use only!`,
        ticketCode: ticket.ticketCode,
        status: 'already_used',
        usedAt: ticket.scannedAt,
        previousScannedBy: ticket.scannedBy
      });
    }

    // Mark ticket as used
    const now = new Date().toISOString();
    await db.run(
      `UPDATE PurchasedTickets SET used = 1, usedAt = ?, scannedBy = ?, scannedAt = ? WHERE id = ?`,
      [now, scannedBy || 'staff', now, ticket.id]
    );

    console.log(`✅ Ticket ${ticket.ticketCode} validated and marked as used`);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Ticket validated successfully! Attendee checked in.',
      ticketCode: ticket.ticketCode,
      ticketType: ticket.ticketType,
      eventTitle: ticket.eventTitle,
      holderName: ticket.holderName,
      purchaserEmail: ticket.purchaserEmail,
      status: 'valid',
      checkedInAt: now,
      checkedInBy: scannedBy || 'staff',
      timestamp: now
    });

  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to scan ticket',
      error: error.message,
      status: 'error'
    });
  }
});

// GET /api/purchases/inventory/:eventId - Get ticket inventory
router.get('/inventory/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    // Mock inventory data - replace with actual database query
    const inventory = {
      eventId,
      eventTitle: 'E MARTÉ',
      ticketTypes: [
        {
          type: 'vip',
          name: 'VIP',
          price: 500,
          total: 50,
          sold: 23,
          available: 27,
          checkedIn: 18,
          pending: 5
        },
        {
          type: 'standard',
          name: 'Standard',
          price: 300,
          total: 200,
          sold: 145,
          available: 55,
          checkedIn: 120,
          pending: 25
        },
        {
          type: 'group',
          name: 'Group of 4',
          price: 1200,
          total: 100,
          sold: 67,
          available: 33,
          checkedIn: 54,
          pending: 13
        }
      ],
      totalCapacity: 350,
      totalSold: 235,
      totalAvailable: 115,
      totalCheckedIn: 192,
      totalPending: 43,
      lastUpdated: new Date().toISOString()
    };

    res.json(inventory);
  } catch (error) {
    console.error('Inventory error:', error);
    res.status(500).json({ message: 'Failed to fetch inventory' });
  }
});

// GET /api/purchases/stats - Get attendance statistics
router.get('/stats/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const stats = {
      eventId,
      eventName: 'E MARTÉ',
      totalTickets: 235,
      checkedIn: 192,
      notCheckedIn: 43,
      attendanceRate: ((192 / 235) * 100).toFixed(1) + '%',
      leftToArrive: 43,
      timestamp: new Date().toISOString()
    };

    res.json(stats);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// GET /api/purchases/download/:purchaseId - Download ticket PDF
router.get('/download/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;

    if (!purchaseId || !/^[a-f0-9]{8}$/.test(purchaseId)) {
      return res.status(400).json({ message: 'Invalid purchase ID' });
    }

    // Find PDF file with this purchaseId
    const files = fs.readdirSync(PDFDir);
    const pdfFile = files.find(f => f.startsWith(`ticket-${purchaseId}-`));

    if (!pdfFile) {
      return res.status(404).json({ message: 'Ticket PDF not found' });
    }

    const pdfPath = path.join(PDFDir, pdfFile);

    // Check if file exists and is readable
    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ message: 'PDF file not found' });
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="madverse-ticket-${purchaseId}.pdf"`);
    
    // Stream the PDF file
    const fileStream = fs.createReadStream(pdfPath);
    fileStream.pipe(res);

    fileStream.on('error', (err) => {
      console.error('PDF download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Failed to download PDF' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to process download request' });
  }
});

export default router;
