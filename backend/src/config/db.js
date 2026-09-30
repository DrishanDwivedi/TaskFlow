const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'taskflow_user',
  password: process.env.DB_PASSWORD || 'taskflow_secure_password',
  database: process.env.DB_NAME || 'taskflow_db',
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

const initDb = async () => {
  const client = await pool.connect();
  try {
    console.log(`Connecting to PostgreSQL at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}...`);

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'To Do',
        priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
        due_date DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL database initialized successfully.');
  } finally {
    client.release();
  }
};

const getEngine = () => 'PostgreSQL';

module.exports = {
  pool,
  initDb,
  getEngine,
};
