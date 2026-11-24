import { Pool } from 'pg';
import { config } from './env';

class Database {
  private static instance: Pool | null = null;
  public static isConnected = false;

  public static getPool(): Pool | null {
    if (!this.instance && config.databaseUrl) {
      try {
        this.instance = new Pool({
          connectionString: config.databaseUrl,
          ssl: config.databaseUrl.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
          max: 10,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        });

        this.instance.on('error', (err) => {
          console.error('[DB] Unexpected error on idle PostgreSQL client:', err.message);
        });
      } catch (err: any) {
        console.warn('[DB] Failed to initialize PostgreSQL pool:', err.message);
      }
    }
    return this.instance;
  }

  public static async testConnection(): Promise<boolean> {
    const pool = this.getPool();
    if (!pool) {
      console.info('[DB] DATABASE_URL not provided. Using persistent in-memory repository store.');
      return false;
    }
    try {
      const res = await pool.query('SELECT NOW()');
      this.isConnected = true;
      console.info('[DB] Connected to PostgreSQL at:', res.rows[0].now);
      return true;
    } catch (err: any) {
      console.warn('[DB] Connection check failed:', err.message, '- falling back to in-memory store.');
      this.isConnected = false;
      return false;
    }
  }

  public static async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const pool = this.getPool();
    if (!pool) {
      throw new Error('Database pool not configured');
    }
    const res = await pool.query(text, params);
    return res.rows;
  }
}

export default Database;
