import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';

const schemaPath = path.join(process.cwd(), 'db-schema-mysql.sql');

async function main() {
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || 'root';

  const sql = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true
  });

  try {
    // Force a clean reload so table definitions always match the schema file.
    await connection.query('DROP DATABASE IF EXISTS ticketapp_db');
    await connection.query(sql);
    console.log('Schema loaded successfully from db-schema-mysql.sql');
  } finally {
    await connection.end();
  }
}

main().catch((error) => {
  console.error('Failed to load schema:', error.message);
  process.exit(1);
});
