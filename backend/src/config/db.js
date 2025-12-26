const { Pool } = require('pg');

let db;

const connectDB = async () => {
  try {
    db = new Pool({
  user: process.env.DB_USER || 'RohitDhiman',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'uploads',
  port: process.env.DB_PORT || 5432,
});
    await db.query('SELECT 1');

    console.log('✅ PostgreSQL connected');
    return db;
  } catch (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
    process.exit(1); 
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('DB not initialized. Call connectDB() first.');
  }
  return db;
};

module.exports = { connectDB, getDB };