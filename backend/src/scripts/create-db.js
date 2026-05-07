const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../../.env' }); // adjusted for src/scripts/

const createDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });

    const dbName = process.env.DB_NAME || 'dental_clinic';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    console.log(`Database '${dbName}' created or already exists.`);
    
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('Error creating database:', error);
    process.exit(1);
  }
};

createDB();
