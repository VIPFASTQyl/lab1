import bcrypt from 'bcryptjs';
import { getDbPool } from './src/db.js';

async function createRegularUser() {
  try {
    const db = await getDbPool();
    const hash = await bcrypt.hash('erjon31', 10);
    await db.run(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash, IsAdmin) VALUES (?, ?, ?, ?, ?)',
      ['Erjon', 'Gashi', 'gashierjon31@gmail.com', hash, 0]
    );
    console.log('? Regular user created successfully!');
    console.log('Email: gashierjon31@gmail.com');
  } catch (err) {
    console.error('Error:', err.message);
  }
}
createRegularUser();
