import { Pool, PoolClient } from 'pg';
import type { Utilisateur, UserRole } from '../types/database';

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

// Authentification functions
export class PostgresAuth {
  static async authenticateUser(email: string, password: string): Promise<{ user: Utilisateur | null; error: string | null }> {
    try {
      const queryText = 'SELECT * FROM utilisateurs WHERE email = $1';
      const result = await query(queryText, [email]);
      
      if (result.rows.length === 0) {
        return { user: null, error: 'Email ou mot de passe incorrect' };
      }

      const user = result.rows[0] as Utilisateur;
      
      // Vérification simple du mot de passe (à améliorer avec bcrypt en production)
      if (user.mot_de_passe_hash !== password) {
        return { user: null, error: 'Email ou mot de passe incorrect' };
      }

      return { user, error: null };
    } catch (error) {
      console.error('Erreur d\'authentification:', error);
      return { user: null, error: 'Erreur de connexion à la base de données' };
    }
  }

  static async getUserById(id: number): Promise<Utilisateur | null> {
    try {
      const queryText = 'SELECT * FROM utilisateurs WHERE id = $1';
      const result = await query(queryText, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<Utilisateur | null> {
    try {
      const queryText = 'SELECT * FROM utilisateurs WHERE email = $1';
      const result = await query(queryText, [email]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  static async createUser(email: string, password: string, role: UserRole = 'utilisateur'): Promise<{ user: Utilisateur | null; error: string | null }> {
    try {
      const queryText = `
        INSERT INTO utilisateurs (email, mot_de_passe_hash, role) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;
      const result = await query(queryText, [email, password, role]);
      return { user: result.rows[0], error: null };
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      return { user: null, error: 'Erreur lors de la création du compte' };
    }
  }
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
