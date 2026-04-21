import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_SERVER || process.env.DB_HOST || 'localhost';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || 'root';
const dbName = process.env.DB_NAME || 'ticketapp_db';

async function setupDatabase() {
  let connection;
  try {
    // Connect to MySQL server without specifying a database
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword
    });

    console.log(`Connecting to MySQL at ${dbHost}...`);
    console.log(`Creating database: ${dbName}...`);

    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`✓ Database "${dbName}" is ready`);

    await connection.end();
    return true;
  } catch (error) {
    console.error('Error setting up database:', error.message);
    console.error('\nPlease ensure:');
    console.error('1. MySQL Server is running');
    console.error(`2. User "${dbUser}" exists with password "${dbPassword}"`);
    console.error(`3. Host is accessible at ${dbHost}`);
    return false;
  }
}

// Run setup
setupDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
