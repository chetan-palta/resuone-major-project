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
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NULL,
        password_hash VARCHAR(255) NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Existing resumes table modification or creation
    await connection.query(`
      CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NULL,
        resume_data JSON NULL,
        template_type VARCHAR(100) DEFAULT 'modern',
        personal_details JSON NULL,
        summary TEXT NULL,
        education JSON NULL,
        skills JSON NULL,
        projects JSON NULL,
        experience JSON NULL,
        extra_curricular JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // If table existed before this update, let's safely try to add user_id just in case
    try {
      await connection.query('ALTER TABLE resumes ADD COLUMN user_id VARCHAR(36) NULL;');
      await connection.query('ALTER TABLE resumes ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;');
    } catch (e) { /* Column might already exist */ }

    // Safely add resume_data and template_type just in case it existed
    try { await connection.query('ALTER TABLE resumes ADD COLUMN resume_data JSON NULL;'); } catch (e) { }
    try { await connection.query('ALTER TABLE resumes ADD COLUMN template_type VARCHAR(100) DEFAULT "modern";'); } catch (e) { }

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error during database initialization:', error);
  } finally {
    if (connection) connection.release();
  }
};

export default db;

