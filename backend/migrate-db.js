import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'ticketapp.db');

(async () => {
  try {
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    try {
      console.log('Adding ResetToken column...');
      await db.exec(`ALTER TABLE Users ADD COLUMN ResetToken TEXT`);
      console.log('✓ ResetToken column added');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ ResetToken column already exists');
      } else {
        console.error('Error adding ResetToken:', err.message);
      }
    }

    try {
      console.log('Adding ResetTokenExpiry column...');
      await db.exec(`ALTER TABLE Users ADD COLUMN ResetTokenExpiry TEXT`);
      console.log('✓ ResetTokenExpiry column added');
    } catch (err) {
      if (err.message.includes('duplicate column')) {
        console.log('✓ ResetTokenExpiry column already exists');
      } else {
        console.error('Error adding ResetTokenExpiry:', err.message);
      }
    }

    await db.close();
    console.log('\n✅ Database migration completed!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
