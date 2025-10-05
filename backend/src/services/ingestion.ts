import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import pdfParse from 'pdf-parse';
import { parse as parseCsvSync } from 'csv-parse/sync';
import { parseDentrixPdf, parseEaglesoftPdf } from './ingestion-parsers';
import { eq, desc, inArray } from 'drizzle-orm';
import { ingestionJobs, ingestionRecords, ingestionMappings } from '../database/ingestion';
import * as schema from '../database/schema';
import { DatabaseService } from './database';
import { logger } from '../utils/logger';

export type IngestionParams = {
  practiceId: string;
  userId?: string;
  sourceSystem: 'dentrix' | 'dentalintel' | 'adp' | 'eaglesoft';
  dataset: string; // patients | appointments | payroll | unknown
  originalFilename: string;
  storagePath: string;
  fileType: 'csv' | 'pdf' | 'json' | 'txt' | 'unknown';
};

export class IngestionService {
  static uploadsRoot(): string {
    return process.env.INGESTION_UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  }

  static async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  static detectFileType(filename: string): IngestionParams['fileType'] {
    const ext = path.extname(filename).toLowerCase();
    if (ext === '.csv') return 'csv';
    if (ext === '.pdf') return 'pdf';
    if (ext === '.json') return 'json';
    if (ext === '.txt') return 'txt';
    return 'unknown';
  }

  static async createJob(params: IngestionParams) {
    const db = DatabaseService.getInstance().getDb();
    const [job] = await db.insert(ingestionJobs).values({
      practiceId: params.practiceId,
      userId: params.userId,
      sourceSystem: params.sourceSystem as any,
      dataset: params.dataset,
      originalFilename: params.originalFilename,
      storagePath: params.storagePath,
      fileType: params.fileType as any,
      status: 'uploaded',
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return job;
  }

  static async listJobs(practiceIds: string[], limit = 50) {
    const db = DatabaseService.getInstance().getDb();
    const rows = await db
      .select()
      .from(ingestionJobs)
      .where(inArray(ingestionJobs.practiceId, practiceIds))
      .orderBy(desc(ingestionJobs.createdAt))
      .limit(limit);
    return rows;
  }

  static async getJob(jobId: string) {
    const db = DatabaseService.getInstance().getDb();
    const rows = await db.select().from(ingestionJobs).where(eq(ingestionJobs.id, jobId)).limit(1);
    return rows[0] || null;
  }

  static async getJobRecords(jobId: string, limit = 50, offset = 0) {
    const db = DatabaseService.getInstance().getDb();
    const rows = await db.select().from(ingestionRecords)
      .where(eq(ingestionRecords.jobId, jobId))
      .orderBy(ingestionRecords.index)
      .limit(limit).offset(offset);
    return rows;
  }

  static async processJob(jobId: string) {
    const db = DatabaseService.getInstance().getDb();
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');

    // Update status to processing
    await db.update(ingestionJobs).set({
      status: 'processing',
      startedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(ingestionJobs.id, jobId));

    let total = 0, processed = 0, failed = 0;
    try {
      if (job.fileType === 'csv') {
        const fileBuffer = await fs.readFile(job.storagePath);
        const records: any[] = parseCsvSync(fileBuffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        });
        total = records.length;
        const batchValues = records.map((rec, idx) => ({
          jobId: job.id,
          index: idx,
          dataset: job.dataset,
          data: rec,
          createdAt: new Date(),
        }));
        // Insert in chunks to avoid huge single insert
        const chunkSize = 1000;
        for (let i = 0; i < batchValues.length; i += chunkSize) {
          const chunk = batchValues.slice(i, i + chunkSize);
          await db.insert(ingestionRecords).values(chunk);
        }
        processed = total;
      } else if (job.fileType === 'pdf') {
        const dataBuffer = await fs.readFile(job.storagePath);
        const parsed = await pdfParse(dataBuffer);
        const text = parsed.text;
        
        let records: any[] = [];
        if (job.sourceSystem === 'dentrix') {
          records = await parseDentrixPdf(text);
        } else if (job.sourceSystem === 'eaglesoft') {
          records = await parseEaglesoftPdf(text);
        } else {
          records.push({ text });
        }

        total = records.length;
        processed = 0;
        if (total > 0) {
          const batchValues = records.map((rec, idx) => ({
            jobId: job.id,
            index: idx,
            dataset: job.dataset,
            data: rec,
            createdAt: new Date(),
          }));
          // Insert in chunks to avoid huge single insert
          const chunkSize = 1000;
          for (let i = 0; i < batchValues.length; i += chunkSize) {
            const chunk = batchValues.slice(i, i + chunkSize);
            await db.insert(ingestionRecords).values(chunk);
          }
          processed = total;
        }
      } else if (job.fileType === 'json' || job.fileType === 'txt') {
        const fileContent = await fs.readFile(job.storagePath, 'utf8');
        let payload: any;
        try { payload = JSON.parse(fileContent); } catch {
          payload = { content: fileContent };
        }
        const arr = Array.isArray(payload) ? payload : [payload];
        total = arr.length;
        for (let i = 0; i < arr.length; i++) {
          await db.insert(ingestionRecords).values({ jobId: job.id, index: i, dataset: job.dataset, data: arr[i], createdAt: new Date() });
        }
        processed = total;
      } else {
        throw new Error('Unsupported file type for processing');
      }

      await db.update(ingestionJobs).set({
        status: 'completed',
        totalRecords: total,
        processedRecords: processed,
        failedRecords: failed,
        completedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(ingestionJobs.id, job.id));

      return { total, processed, failed };
    } catch (err: any) {
      logger.error('Ingestion processing failed', { jobId: job.id, err });
      await db.update(ingestionJobs).set({
        status: 'failed',
        error: String(err?.message || err),
        updatedAt: new Date(),
      }).where(eq(ingestionJobs.id, job.id));
      throw err;
    }
  }

  static async getHeaders(jobId: string): Promise<string[]> {
    const rows = await this.getJobRecords(jobId, 5, 0);
    const keys = new Set<string>();
    for (const r of rows) {
      if (r?.data && typeof r.data === 'object') {
        Object.keys(r.data).forEach(k => keys.add(k));
      }
    }
    return Array.from(keys);
  }

  static async saveMapping(opts: { practiceId: string; sourceSystem: string; dataset: string; target: 'patients'|'appointments'; fieldMap: Record<string,string>; createdBy?: string; }) {
    const db = DatabaseService.getInstance().getDb();
    const [mapping] = await db.insert(ingestionMappings).values({
      practiceId: opts.practiceId,
      sourceSystem: opts.sourceSystem as any,
      dataset: opts.dataset,
      target: opts.target,
      fieldMap: opts.fieldMap as any,
      createdBy: opts.createdBy,
      createdAt: new Date(),
    }).returning();
    return mapping;
  }

  static async promotePatients(jobId: string, fieldMap: Record<string,string>) {
    const db = DatabaseService.getInstance().getDb();
    const job = await this.getJob(jobId);
    if (!job) throw new Error('Job not found');
    const rows = await this.getJobRecords(jobId, 10000, 0);
    let inserted = 0, failed = 0;
    for (const r of rows) {
      const src = r.data || {} as Record<string, any>;
      const get = (k: string | undefined) => (k ? (src as Record<string, any>)[k] : undefined);
      try {
        const record: any = {
          practiceId: job.practiceId,
          externalId: get(fieldMap['externalId']) || undefined,
          firstName: get(fieldMap['firstName']),
          lastName: get(fieldMap['lastName']),
          email: get(fieldMap['email']) || undefined,
          phone: get(fieldMap['phone']) || undefined,
          gender: get(fieldMap['gender']) || undefined,
          notes: get(fieldMap['notes']) || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const dobKey = fieldMap['dateOfBirth'];
        const dobVal = get(dobKey);
        if (dobKey && dobVal) {
          const d = new Date(String(dobVal));
          if (!isNaN(d.getTime())) record.dateOfBirth = d;
        }
        const [insertedRow] = await db.insert(schema.patients).values(record as any).returning();
        if (insertedRow) inserted++; else failed++;
      } catch (e) {
        failed++;
      }
    }
    return { inserted, failed, total: rows.length };
  }
}

export default IngestionService;
