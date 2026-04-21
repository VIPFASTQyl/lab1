import bcrypt from 'bcryptjs';
import { getDbPool } from './src/db.js';

async function createAdmin() {
  try {
    const db = await getDbPool();
    const hash = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash, IsAdmin) VALUES (?, ?, ?, ?, ?)',
      ['Admin', 'User', 'admin@ticketapp.com', hash, 1]
    );
    console.log('? Admin user created successfully!');
    console.log('Email: admin@ticketapp.com');
    console.log('Password: admin123');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
createAdmin();
