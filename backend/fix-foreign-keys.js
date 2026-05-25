import mysql from 'mysql2/promise';
import { dbConfig } from './src/config.js';

async function fixForeignKeys() {
  try {
    const pool = await mysql.createPool({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
    });

    const conn = await pool.getConnection();
    
    try {
      console.log('Checking existing foreign keys...');
      
      // First try to drop the existing foreign key
      try {
        await conn.execute('ALTER TABLE Tickets DROP FOREIGN KEY tickets_ibfk_2');
        console.log('Dropped old foreign key constraint');
      } catch (e) {
        // Try alternate name
        try {
          await conn.execute('ALTER TABLE Tickets DROP FOREIGN KEY Tickets_ibfk_2');
          console.log('Dropped old foreign key constraint (alternate name)');
        } catch (e2) {
          console.log('Old constraint not found, continuing...');
        }
      }
      
      // Add the new foreign key with CASCADE DELETE
      await conn.execute(
        'ALTER TABLE Tickets ADD CONSTRAINT tickets_ibfk_2 FOREIGN KEY (SectorId) REFERENCES Sectors(SectorId) ON DELETE CASCADE'
      );
      console.log('✅ Successfully added CASCADE DELETE constraint to Tickets.SectorId');
      
      // Similar fix for EventId
      try {
        await conn.execute('ALTER TABLE Tickets DROP FOREIGN KEY tickets_ibfk_1');
        console.log('Dropped old EventId constraint');
      } catch (e) {
        try {
          await conn.execute('ALTER TABLE Tickets DROP FOREIGN KEY Tickets_ibfk_1');
          console.log('Dropped old EventId constraint (alternate name)');
        } catch (e2) {
          console.log('Old EventId constraint not found, continuing...');
        }
      }
      
      await conn.execute(
        'ALTER TABLE Tickets ADD CONSTRAINT tickets_ibfk_1 FOREIGN KEY (EventId) REFERENCES Events(EventId) ON DELETE CASCADE'
      );
      console.log('✅ Successfully added CASCADE DELETE constraint to Tickets.EventId');
      
    } finally {
      await conn.release();
      await pool.end();
    }
    
    console.log('✅ Database migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during migration:', err.message);
    process.exit(1);
  }
}

fixForeignKeys();
