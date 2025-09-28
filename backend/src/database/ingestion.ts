import { pgTable, uuid, varchar, text, boolean, timestamp, jsonb, integer, pgEnum } from 'drizzle-orm/pg-core';
import { practices, users, integrationTypeEnum } from './schema';

export const ingestionStatusEnum = pgEnum('ingestion_status', ['uploaded', 'processing', 'completed', 'failed']);
export const ingestionFileTypeEnum = pgEnum('ingestion_file_type', ['csv', 'pdf', 'json', 'txt', 'unknown']);

export const ingestionJobs = pgTable('ingestion_jobs', {
  id: uuid('id').primaryKey().defaultRandom(),
  practiceId: uuid('practice_id').notNull().references(() => practices.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  sourceSystem: integrationTypeEnum('source_system').notNull(),
  dataset: varchar('dataset', { length: 100 }).notNull().default('unknown'),
  fileType: ingestionFileTypeEnum('file_type').notNull().default('unknown'),
  originalFilename: varchar('original_filename', { length: 512 }).notNull(),
  storagePath: varchar('storage_path', { length: 1024 }).notNull(),
  status: ingestionStatusEnum('status').notNull().default('uploaded'),
  totalRecords: integer('total_records').default(0),
  processedRecords: integer('processed_records').default(0),
  failedRecords: integer('failed_records').default(0),
  error: text('error'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const ingestionRecords = pgTable('ingestion_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  jobId: uuid('job_id').notNull().references(() => ingestionJobs.id, { onDelete: 'cascade' }),
  index: integer('index').notNull().default(0),
  dataset: varchar('dataset', { length: 100 }).notNull().default('unknown'),
  data: jsonb('data').notNull(),
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Saved mapping templates per source/dataset/practice
export const ingestionMappings = pgTable('ingestion_mappings', {
  id: uuid('id').primaryKey().defaultRandom(),
  practiceId: uuid('practice_id').notNull().references(() => practices.id, { onDelete: 'cascade' }),
  sourceSystem: integrationTypeEnum('source_system').notNull(),
  dataset: varchar('dataset', { length: 100 }).notNull(),
  target: varchar('target', { length: 100 }).notNull(), // patients | appointments
  fieldMap: jsonb('field_map').notNull(), // { targetField: sourceHeader }
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
