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
  emailUser: process.env.EMAIL_USER || 'your-email@gmail.com',
  emailPassword: process.env.EMAIL_PASSWORD || 'your-app-password'
};

export const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
