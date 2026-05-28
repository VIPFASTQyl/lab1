const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const mysql = require('mysql2/promise');

async function run() {
  const pool = await mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'ticketapp_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  const sql = `ALTER TABLE Partners 
               MODIFY COLUMN logo_url LONGTEXT,
               MODIFY COLUMN link LONGTEXT,
               MODIFY COLUMN description LONGTEXT`;

  try {
    await pool.execute(sql);
    console.log('✅ Partners table schema updated successfully!');
  } catch (err) {
    console.error('❌ ALTER TABLE error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
