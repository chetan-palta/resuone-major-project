import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const testDb = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
        });
        console.log('Successfully connected to MySQL');
        await connection.end();
    } catch (error) {
        console.error('Failed to connect to MySQL:', error);
    }
};

testDb();
