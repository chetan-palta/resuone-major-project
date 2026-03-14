import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const dbName = process.env.DB_NAME || 'resuone';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and log status
(async () => {
  try {
    const connection = await db.getConnection();
    console.log("Connected to MySQL database");
    connection.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

export const initDb = async () => {
  let connection;
  try {
    // Connect without DB to create it first if necessary
    const setupConnection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });
    
    await setupConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await setupConnection.end();

    connection = await db.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(36) PRIMARY KEY,
        personal_details JSON,
        summary TEXT,
        education JSON,
        skills JSON,
        projects JSON,
        experience JSON,
        extra_curricular JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    if (connection) connection.release();
  }
};

export default db;

