import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    // users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) UNIQUE NOT NULL,
        password_hash varchar(255) NOT NULL,
        role varchar(20) NOT NULL,
        first_name varchar(100),
        last_name varchar(100),
        preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
        active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);

    // practices
    await client.query(`
      CREATE TABLE IF NOT EXISTS practices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        address jsonb NOT NULL DEFAULT '{}'::jsonb,
        description text,
        phone varchar(20),
        email varchar(255),
        operating_hours jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // user_practices
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_practices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        role varchar(20) NOT NULL,
        permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_user_practice UNIQUE(user_id, practice_id)
      );
    `);

    await client.query('COMMIT');
    console.log('✅ Migration completed');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed', e);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
