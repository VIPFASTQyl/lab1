import express from 'express';
import { MailtrapClient } from 'mailtrap';
import { emailConfig } from './config.js';

const router = express.Router();

// Create Mailtrap client
const client = new MailtrapClient({
  token: emailConfig.apiKey
});

const sender = {
  name: 'Madverse',
  email: 'sender@example.com'
};

// POST: Send contact form email
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Send email to admin
    await client.send({
      from: sender,
      to: [{ email: emailConfig.recipientEmail }],
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Reply to: ${email}</small></p>
      `
    });

    // Send confirmation email to user
    await client.send({
      from: sender,
      to: [{ email: email }],
      subject: 'Thank you for contacting Madverse',
      html: `
        <h2>We received your message</h2>
        <p>Hi ${name},</p>
        <p>Thank you for contacting Madverse. We have received your message and will get back to you as soon as possible.</p>
        <hr>
        <p><strong>Your Message Summary:</strong></p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Best regards,<br>The Madverse Team</p>
      `
    });

    res.json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

export default router;
