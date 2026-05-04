import mysql from 'mysql2/promise';
import { dbConfig } from './config.js';

let pool;

export function getMySqlPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  return pool;
}

export async function checkMySqlConnection() {
  const mysqlPool = getMySqlPool();
  const connection = await mysqlPool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}
