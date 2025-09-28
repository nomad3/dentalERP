import { Router } from 'express';
import { logger } from '../utils/logger';
import { AnalyticsService, parsePracticeIds } from '../services/analytics';

const router = Router();

// Executive BI Analytics Endpoints
router.get('/executive-kpis', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };

    logger.info('Executive KPIs requested', { practiceIds, dateRange, userId: (req as any).user?.userId });

    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getExecutiveKPIs(ids, dateRange);

    res.json({ success: true, data, timestamp: new Date().toISOString(), practiceIds: ids, dateRange });
  } catch (error) {
    logger.error('Executive KPIs error:', error);
    res.status(500).json({ error: 'Failed to fetch executive KPIs' });
  }
});

router.get('/revenue-trends', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    logger.info('Revenue trends requested', { practiceIds, dateRange });
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getRevenueTrends(ids, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Revenue trends error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue trends' });
  }
});

router.get('/location-performance', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    logger.info('Location performance requested', { practiceIds, dateRange });
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getLocationPerformance(ids, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Location performance error:', error);
    res.status(500).json({ error: 'Failed to fetch location performance' });
  }
});

// Manager BI Analytics Endpoints
router.get('/manager-metrics', async (req, res) => {
  try {
    const { practiceId, date } = req.query as { practiceId?: string; date?: string };
    logger.info('Manager metrics requested', { practiceId, date });
    if (!practiceId) return res.status(400).json({ error: 'practiceId is required' });
    const service = AnalyticsService.getInstance();
    const data = await service.getManagerMetrics(practiceId, date);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Manager metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch manager metrics' });
  }
});

// Clinician BI Analytics
router.get('/clinical-metrics', async (req, res) => {
  try {
    const { providerId, dateRange } = req.query as { providerId?: string; dateRange?: string };
    if (!providerId) return res.status(400).json({ error: 'providerId is required' });
    const service = AnalyticsService.getInstance();
    const data = await service.getClinicalMetrics(providerId, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Clinical metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch clinical metrics' });
  }
});

// Integration Status for BI monitoring
router.get('/integration-status', async (req, res) => {
  try {
    const service = AnalyticsService.getInstance();
    const data = await service.getIntegrationStatus();
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Integration status error:', error);
    res.status(500).json({ error: 'Failed to fetch integration status' });
  }
});

export default router;
