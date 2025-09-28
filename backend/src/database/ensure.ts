import { Pool } from 'pg';

export async function ensureCoreTables(pool: Pool): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    // Users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email varchar(255) UNIQUE NOT NULL,
        password_hash varchar(255) NOT NULL,
        role varchar(20) NOT NULL,
        first_name varchar(100),
        last_name varchar(100),
        active boolean NOT NULL DEFAULT true,
        last_login timestamptz,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login timestamptz;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name varchar(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name varchar(100);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;
    `);

    // Practices
    await client.query(`
      CREATE TABLE IF NOT EXISTS practices (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name varchar(255) NOT NULL,
        address jsonb,
        phone varchar(20),
        email varchar(255),
        operating_hours jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Locations
    await client.query(`
      CREATE TABLE IF NOT EXISTS locations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        name varchar(255) NOT NULL,
        address jsonb,
        phone varchar(20),
        email varchar(255),
        operating_hours jsonb,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // User-Practices
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

    // Patients
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        first_name varchar(100) NOT NULL,
        last_name varchar(100) NOT NULL,
        email varchar(255),
        phone varchar(20),
        status varchar(20) NOT NULL DEFAULT 'active',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Appointments
    await client.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        patient_id uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        provider_id uuid NOT NULL REFERENCES users(id),
        location_id uuid REFERENCES locations(id),
        scheduled_start timestamptz NOT NULL,
        scheduled_end timestamptz NOT NULL,
        appointment_type varchar(100),
        procedures jsonb NOT NULL DEFAULT '[]'::jsonb,
        status varchar(30) NOT NULL DEFAULT 'scheduled',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Integrations
    await client.query(`
      CREATE TABLE IF NOT EXISTS integrations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        type varchar(50) NOT NULL,
        name varchar(255) NOT NULL,
        status varchar(30) NOT NULL DEFAULT 'pending',
        config jsonb NOT NULL,
        is_active boolean NOT NULL DEFAULT true,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

