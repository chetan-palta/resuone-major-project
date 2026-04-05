require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

(async () => {
  const dbName = process.env.DB_NAME || 'resuone';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName
  });

  const email = 'admin@resuone.com';
  const password = 'admin'; // Sample admin password
  
  const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length > 0) {
    console.log('Admin user already exists.');
  } else {
    const id = crypto.randomUUID();
    const hash = await bcrypt.hash(password, 10);
    await connection.query(
      'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      [id, email, 'Admin User', hash]
    );
    console.log('Admin user created: admin@resuone.com / admin');
  }

  await connection.end();
})();
