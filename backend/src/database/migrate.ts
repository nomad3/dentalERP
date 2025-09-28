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

    // BI Daily Metrics table for aggregated analytics (synthetic/demo-friendly)
    await client.query(`
      CREATE TABLE IF NOT EXISTS bi_daily_metrics (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        practice_id uuid NOT NULL REFERENCES practices(id) ON DELETE CASCADE,
        location_id uuid REFERENCES locations(id),
        date timestamptz NOT NULL,

        revenue integer DEFAULT 0,
        target_revenue integer DEFAULT 0,
        new_patients integer DEFAULT 0,
        returning_patients integer DEFAULT 0,

        schedule_utilization integer DEFAULT 0,
        no_shows integer DEFAULT 0,
        cancellations integer DEFAULT 0,
        avg_wait_time integer DEFAULT 0,

        staff_utilization integer DEFAULT 0,
        chair_utilization integer DEFAULT 0,
        ontime_performance integer DEFAULT 0,
        treatment_completion integer DEFAULT 0,

        claims_submitted integer DEFAULT 0,
        claims_denied integer DEFAULT 0,
        collections_amount integer DEFAULT 0,
        ar_current integer DEFAULT 0,
        ar_30 integer DEFAULT 0,
        ar_60 integer DEFAULT 0,
        ar_90 integer DEFAULT 0,

        benchmark_score integer DEFAULT 0,
        forecast_revenue integer DEFAULT 0,
        forecast_patients integer DEFAULT 0,

        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `);

    // Align patients table with full schema used by Drizzle ORM/seed
    // Add missing advanced columns in an idempotent way
    await client.query(`
      ALTER TABLE patients
        ADD COLUMN IF NOT EXISTS external_id varchar(100),
        ADD COLUMN IF NOT EXISTS date_of_birth timestamp,
        ADD COLUMN IF NOT EXISTS gender varchar(20),
        ADD COLUMN IF NOT EXISTS address jsonb,
        ADD COLUMN IF NOT EXISTS emergency_contact jsonb,
        ADD COLUMN IF NOT EXISTS insurance jsonb NOT NULL DEFAULT '[]'::jsonb,
        ADD COLUMN IF NOT EXISTS medical_history jsonb NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS dental_history jsonb NOT NULL DEFAULT '{}'::jsonb,
        ADD COLUMN IF NOT EXISTS notes text,
        ADD COLUMN IF NOT EXISTS last_visit timestamp,
        ADD COLUMN IF NOT EXISTS next_appointment timestamp;
    `);

    // Align appointments table with Drizzle schema (adds optional columns used by seed/API)
    await client.query(`
      ALTER TABLE appointments
        ADD COLUMN IF NOT EXISTS external_id varchar(100),
        ADD COLUMN IF NOT EXISTS actual_start timestamp,
        ADD COLUMN IF NOT EXISTS actual_end timestamp,
        ADD COLUMN IF NOT EXISTS check_in_time timestamp,
        ADD COLUMN IF NOT EXISTS wait_time integer,
        ADD COLUMN IF NOT EXISTS room_number varchar(20),
        ADD COLUMN IF NOT EXISTS notes text;
    `);

    // Align integrations table to include optional sync metadata
    await client.query(`
      ALTER TABLE integrations
        ADD COLUMN IF NOT EXISTS last_sync timestamptz,
        ADD COLUMN IF NOT EXISTS last_error text;
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
