import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }

  console.info('Connecting to Neon PostgreSQL...');
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.info('Connected successfully to Neon!');

    const sqlPath = path.resolve(__dirname, '../../migrations/001_initial_schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        console.info('Executing:', stmt.substring(0, 40).replace(/\n/g, ' ') + '...');
        await client.query(stmt);
      } catch (err: any) {
        console.error('Error on statement:', stmt.substring(0, 50).replace(/\n/g, ' '));
        console.error('Message:', err.message);
      }
    }

    const check = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name LIKE 'scan%'
      ORDER BY table_name;
    `);
    console.info('FlowLens tables in Neon database:', check.rows.map((r: any) => r.table_name).join(', '));
    client.release();
  } catch (err: any) {
    console.error('Migration failed:', err.message);
  } finally {
    await pool.end();
  }
}

runMigration();
