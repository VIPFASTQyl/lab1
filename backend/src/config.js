import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PORT || 5000;

export const dbConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong!Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'TicketAppDb',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'super_secret_key_change_me',
  expiresIn: '1h'
};
