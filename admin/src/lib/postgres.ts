import { Pool, PoolClient } from 'pg';

// Configuration de la connexion PostgreSQL
const poolConfig = {
  host: import.meta.env.POSTGRES_HOST || 'localhost',
  port: parseInt(import.meta.env.POSTGRES_PORT || '5432'),
  database: import.meta.env.POSTGRES_DB || 'cloud_db',
  user: import.meta.env.POSTGRES_USER || 'postgres',
  password: import.meta.env.POSTGRES_PASSWORD || 'postgres123',
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
};

// Create a connection pool
const pool = new Pool(poolConfig);

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<any> {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error', { text, error });
    throw error;
  }
}

// Helper function to get a single client from the pool
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Export the pool for direct access if needed
export { pool };

// Database connection test function
export async function testConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default pool;
