import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { IngestionService } from '../services/ingestion';
import DatabaseService from '../services/database';
import { ingestionJobs as IngestionJobs, ingestionRecords as IngestionRecords } from '../database/ingestion';
import { eq } from 'drizzle-orm';
import { logger } from '../utils/logger';

const router = Router();

// Integration status endpoint for BI monitoring
router.get('/status', async (req, res) => {
  try {
    logger.info('Integration status requested', { userId: req.user?.userId });

    // Mock integration health data for BI dashboard
    const integrationStatus = {
      dentrix: {
        status: 'connected',
        health: 'healthy',
        lastSync: new Date().toISOString(),
        dataPoints: ['patients', 'appointments', 'treatments'],
        uptime: '99.8%'
      },
      dentalintel: {
        status: 'connected',
        health: 'healthy',
        lastSync: new Date(Date.now() - 120000).toISOString(),
        dataPoints: ['analytics', 'benchmarks', 'insights'],
        uptime: '99.9%'
      },
      adp: {
        status: 'syncing',
        health: 'warning',
        lastSync: new Date(Date.now() - 300000).toISOString(),
        dataPoints: ['payroll', 'productivity', 'timetracking'],
        uptime: '98.7%'
      },
      eaglesoft: {
        status: 'connected',
        health: 'healthy',
        lastSync: new Date(Date.now() - 60000).toISOString(),
        dataPoints: ['financials', 'billing', 'claims'],
        uptime: '99.5%'
      }
    };

    res.json({
      success: true,
      data: integrationStatus,
      timestamp: new Date().toISOString(),
      summary: {
        total: 4,
        connected: 3,
        syncing: 1,
        offline: 0
      }
    });
  } catch (error) {
    logger.error('Integration status error:', error);
    res.status(500).json({ error: 'Failed to fetch integration status' });
  }
});

// Individual integration health
router.get('/:system/health', async (req, res) => {
  try {
    const { system } = req.params;

    logger.info('Individual integration health requested', { system });

    // Mock system-specific health data
    const mockHealth = {
      status: 'connected',
      responseTime: Math.floor(Math.random() * 200) + 50,
      lastError: null,
      uptime: '99.8%',
      dataQuality: 'good'
    };

    res.json({
      success: true,
      system,
      data: mockHealth,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Integration health error:', error);
    res.status(500).json({ error: 'Failed to fetch integration health' });
  }
});

// Manual Ingestion Endpoints
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      try {
        const userId = (req as any).user?.userId || 'unknown';
        const today = new Date();
        const dir = path.join(IngestionService.uploadsRoot(), userId, today.toISOString().slice(0,10));
        await fs.mkdir(dir, { recursive: true });
        cb(null, dir);
      } catch (err) {
        cb(err as any, '');
      }
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Supported file types
router.get('/ingestion/supported', async (_req, res) => {
  res.json({
    types: ['csv', 'pdf', 'json', 'txt'],
    maxSizeMB: 50,
  });
});

// Upload a file and create an ingestion job
router.post('/ingestion/upload', upload.single('file'), async (req, res) => {
  try {
    const { practiceId, sourceSystem, dataset } = req.body as any;
    const userId = (req as any).user?.userId as string | undefined;

    if (!practiceId || !sourceSystem || !req.file) {
      return res.status(400).json({ error: 'practiceId, sourceSystem and file are required' });
    }

    const fileType = IngestionService.detectFileType(req.file.originalname);
    const job = await IngestionService.createJob({
      practiceId,
      userId,
      sourceSystem,
      dataset: dataset || 'unknown',
      originalFilename: req.file.originalname,
      storagePath: req.file.path,
      fileType,
    });

    // build a small preview for CSV
    let preview: any = undefined;
    if (fileType === 'csv') {
      const { parse } = await import('csv-parse/sync');
      const buf = await fs.readFile(req.file.path);
      const rows: any[] = parse(buf, { columns: true, skip_empty_lines: true, trim: true });
      preview = rows.slice(0, 5);
    } else if (fileType === 'pdf') {
      preview = { pages: 'text will be extracted during processing' };
    }

    res.status(201).json({
      success: true,
      job,
      preview,
    });
  } catch (error) {
    logger.error('Ingestion upload error:', error);
    res.status(500).json({ error: 'Failed to upload and create ingestion job' });
  }
});

// Trigger processing of an ingestion job
router.post('/ingestion/jobs/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await IngestionService.processJob(id);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Ingestion process error:', error);
    res.status(500).json({ error: 'Failed to process ingestion job' });
  }
});

// List ingestion jobs for accessible practices
router.get('/ingestion/jobs', async (req, res) => {
  try {
    const practiceId = req.query.practiceId as string | undefined;
    const practiceIds = practiceId ? [practiceId] : ((req as any).user?.practiceIds || []);
    const jobs = await IngestionService.listJobs(practiceIds, 100);
    res.json({ success: true, jobs });
  } catch (error) {
    logger.error('Ingestion list jobs error:', error);
    res.status(500).json({ error: 'Failed to list ingestion jobs' });
  }
});

// Get a specific job
router.get('/ingestion/jobs/:id', async (req, res) => {
  try {
    const job = await IngestionService.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    logger.error('Ingestion get job error:', error);
    res.status(500).json({ error: 'Failed to fetch ingestion job' });
  }
});

// Get job records (preview)
router.get('/ingestion/jobs/:id/records', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '50'), 10), 200);
    const offset = Math.max(parseInt(String(req.query.offset || '0'), 10), 0);
    const rows = await IngestionService.getJobRecords(req.params.id, limit, offset);
    res.json({ success: true, records: rows });
  } catch (error) {
    logger.error('Ingestion get records error:', error);
    res.status(500).json({ error: 'Failed to fetch ingestion records' });
  }
});

// Get CSV headers (from staged records)
router.get('/ingestion/jobs/:id/headers', async (req, res) => {
  try {
    const headers = await IngestionService.getHeaders(req.params.id);
    res.json({ success: true, headers });
  } catch (error) {
    logger.error('Ingestion headers error:', error);
    res.status(500).json({ error: 'Failed to fetch headers' });
  }
});

// Save a mapping template
router.post('/ingestion/jobs/:id/map', async (req, res) => {
  try {
    const { target, fieldMap, sourceSystem, dataset, practiceId } = req.body as any;
    const userId = (req as any).user?.userId;
    if (!target || !fieldMap || !sourceSystem || !dataset || !practiceId) {
      return res.status(400).json({ error: 'target, fieldMap, practiceId, sourceSystem and dataset are required' });
    }
    const mapping = await IngestionService.saveMapping({
      practiceId,
      sourceSystem,
      dataset,
      target,
      fieldMap,
      createdBy: userId,
    });
    res.json({ success: true, mapping });
  } catch (error) {
    logger.error('Ingestion save mapping error:', error);
    res.status(500).json({ error: 'Failed to save mapping' });
  }
});

// Promote staged records into domain tables (patients supported)
router.post('/ingestion/jobs/:id/promote', async (req, res) => {
  try {
    const { target, fieldMap } = req.body as any;
    if (target !== 'patients') {
      return res.status(400).json({ error: 'Only patients promotion supported currently' });
    }
    if (!fieldMap) return res.status(400).json({ error: 'fieldMap is required' });
    const result = await IngestionService.promotePatients(req.params.id, fieldMap);
    res.json({ success: true, result });
  } catch (error) {
    logger.error('Ingestion promote error:', error);
    res.status(500).json({ error: 'Failed to promote records' });
  }
});

// Delete a job (and its records), also delete file
router.delete('/ingestion/jobs/:id', async (req, res) => {
  try {
    const job = await IngestionService.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    try { await fs.unlink(job.storagePath); } catch {}
    const db = DatabaseService.getInstance().getDb();
    await db.delete(IngestionRecords).where(eq(IngestionRecords.jobId, job.id));
    await db.delete(IngestionJobs).where(eq(IngestionJobs.id, job.id));
    res.json({ success: true });
  } catch (error) {
    logger.error('Ingestion delete error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Download raw file
router.get('/ingestion/jobs/:id/download', async (req, res) => {
  try {
    const job = await IngestionService.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const filePath = job.storagePath;
    const filename = job.originalFilename;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    logger.error('Ingestion download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
});

// Cancel a job (mark as failed)
router.post('/ingestion/jobs/:id/cancel', async (req, res) => {
  try {
    const db = DatabaseService.getInstance().getDb();
    const job = await IngestionService.getJob(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await db.update(IngestionJobs).set({ status: 'failed', error: 'Cancelled by user', updatedAt: new Date() }).where(eq(IngestionJobs.id, job.id));
    res.json({ success: true });
  } catch (error) {
    logger.error('Ingestion cancel error:', error);
    res.status(500).json({ error: 'Failed to cancel job' });
  }
});

router.get('/', (req, res) => {
  res.json({
    message: 'Integration management API',
    endpoints: [
      'GET /status - Get all integration status',
      'GET /:system/health - Get specific system health',
      'GET /ingestion/supported - Supported file types',
      'POST /ingestion/upload - Upload a file',
      'POST /ingestion/jobs/:id/process - Process uploaded file',
      'GET /ingestion/jobs - List ingestion jobs',
      'GET /ingestion/jobs/:id - Get job details',
      'GET /ingestion/jobs/:id/records - Get ingested records preview',
      'GET /ingestion/jobs/:id/headers - Get source headers',
      'POST /ingestion/jobs/:id/map - Save mapping template',
      'POST /ingestion/jobs/:id/promote - Promote staged records (patients)',
      'POST /ingestion/jobs/:id/cancel - Cancel a job',
      'DELETE /ingestion/jobs/:id - Delete job and records',
      'GET /ingestion/jobs/:id/download - Download uploaded file'
    ]
  });
});

export default router;
