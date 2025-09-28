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

// Additional BI endpoints used by frontend hooks (stubs for MVP)
router.get('/operational-insights', async (req, res) => {
  try {
    const { practiceId, dateRange } = req.query as { practiceId?: string; dateRange?: string };
    logger.info('Operational insights requested', { practiceId, dateRange });
    res.json({
      success: true,
      data: {
        scheduleUtilization: 87.4,
        avgWaitTime: 11,
        cancellations: 3,
        confirmationsPending: 5
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Operational insights error:', error);
    res.status(500).json({ error: 'Failed to fetch operational insights' });
  }
});

// Financial overview (AR, collections, claims)
router.get('/financial-overview', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getFinancialOverview(ids, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Financial overview error:', error);
    res.status(500).json({ error: 'Failed to fetch financial overview' });
  }
});

// Scheduling overview (utilization, no-shows, cancellations, wait time)
router.get('/scheduling-overview', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getSchedulingOverview(ids, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Scheduling overview error:', error);
    res.status(500).json({ error: 'Failed to fetch scheduling overview' });
  }
});

// Retention cohorts
router.get('/retention-cohorts', async (req, res) => {
  try {
    const { practiceIds, months } = req.query as { practiceIds?: string | string[]; months?: string };
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getRetentionCohorts(ids, months ? parseInt(months, 10) : 6);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Retention cohorts error:', error);
    res.status(500).json({ error: 'Failed to fetch retention cohorts' });
  }
});

// Benchmarking
router.get('/benchmarking', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getBenchmarking(ids, dateRange);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Benchmarking error:', error);
    res.status(500).json({ error: 'Failed to fetch benchmarking' });
  }
});

// Forecasting
router.get('/forecasting', async (req, res) => {
  try {
    const { practiceIds } = req.query as { practiceIds?: string | string[] };
    const ids = parsePracticeIds(practiceIds);
    const service = AnalyticsService.getInstance();
    const data = await service.getForecasting(ids);
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Forecasting error:', error);
    res.status(500).json({ error: 'Failed to fetch forecasting' });
  }
});

router.get('/treatment-outcomes', async (req, res) => {
  try {
    const { providerId, dateRange } = req.query as { providerId?: string; dateRange?: string };
    logger.info('Treatment outcomes requested', { providerId, dateRange });
    res.json({
      success: true,
      data: {
        preventiveCare: { successRate: 92, volume: 45 },
        restorative: { successRate: 88, volume: 32 },
        surgical: { successRate: 95, volume: 18 }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Treatment outcomes error:', error);
    res.status(500).json({ error: 'Failed to fetch treatment outcomes' });
  }
});

router.get('/patient-acquisition', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    logger.info('Patient acquisition requested', { practiceIds, dateRange });
    res.json({
      success: true,
      data: {
        referrals: 42,
        marketing: 58,
        walkIns: 16,
        total: 116,
        trend: 'up'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Patient acquisition error:', error);
    res.status(500).json({ error: 'Failed to fetch patient acquisition' });
  }
});

router.get('/staff-productivity', async (req, res) => {
  try {
    const { practiceIds, dateRange } = req.query as { practiceIds?: string | string[]; dateRange?: string };
    logger.info('Staff productivity requested', { practiceIds, dateRange });
    res.json({
      success: true,
      data: {
        utilization: 91.7,
        avgAppointmentsPerProvider: 14,
        overtimeHours: 6,
        remoteStaff: 2
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Staff productivity error:', error);
    res.status(500).json({ error: 'Failed to fetch staff productivity' });
  }
});

export default router;
