import { Router } from 'express';
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

router.get('/', (req, res) => {
  res.json({
    message: 'Integration management API',
    endpoints: [
      'GET /status - Get all integration status',
      'GET /:system/health - Get specific system health'
    ]
  });
});

export default router;
