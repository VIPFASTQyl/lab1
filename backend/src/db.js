import sql from 'mssql';
import { dbConfig } from './config.js';

let pool;

export async function getDbPool() {
  if (pool) return pool;
  try {
    pool = await sql.connect(dbConfig);
    return pool;
  } catch (err) {
    console.error('Error connecting to MSSQL:', err);
    throw err;
  }
}

export { sql };
