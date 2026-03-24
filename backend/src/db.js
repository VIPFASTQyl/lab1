import mysql from 'mysql2/promise';
import { dbConfig } from './config.js';

let pool;

export async function getDbPool() {
  if (pool) return pool;
  try {
    pool = await mysql.createPool(dbConfig);
    console.log('Connected to MySQL database');
    return pool;
  } catch (err) {
    console.error('Error connecting to MySQL:', err);
    throw err;
  }
}

export { mysql };
