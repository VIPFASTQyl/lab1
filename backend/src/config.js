import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ticketapp_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super_secret_key_change_me',
  expiresIn: '1h'
};

export const emailConfig = {
  apiKey: process.env.MAILTRAP_API_KEY || 'your-mailtrap-api-key',
  recipientEmail: process.env.RECIPIENT_EMAIL || 'info@madverse.com'
};
