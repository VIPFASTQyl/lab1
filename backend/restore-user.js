import bcrypt from 'bcryptjs';
import { getDbPool } from './src/db.js';

async function restoreUser() {
  try {
    const db = await getDbPool();
    const hash = await bcrypt.hash('Admin@123', 10);
    await db.run(
      'INSERT INTO Users (FirstName, LastName, Email, PasswordHash, IsAdmin) VALUES (?, ?, ?, ?, ?)',
      ['Fast', 'Vip', 'fastvip02@gmail.com', hash, 1]
    );
    console.log('? Your credentials have been restored!');
    console.log('Email: fastvip02@gmail.com');
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      console.log('User already exists. Updating password to Admin@123...');
      await db.run('UPDATE Users SET PasswordHash = ?, IsAdmin = 1 WHERE Email = ?', [hash, 'fastvip02@gmail.com']);
      console.log('? Password successfully updated!');
    } else {
      console.error('Error:', err.message);
    }
  }
}
restoreUser();
