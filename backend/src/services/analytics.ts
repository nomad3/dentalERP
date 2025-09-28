import { logger } from '../utils/logger';
import { RedisService } from './redis';

type DateRange = '7d' | '30d' | '90d' | '6m' | '12m' | 'ytd' | string;

function parseDateRange(dateRange?: DateRange) {
  const now = new Date();
  let from = new Date();
  if (!dateRange) return { from: new Date(now.getTime() - 30 * 24 * 3600 * 1000), to: now }; // default 30d
  const lower = String(dateRange).toLowerCase();
  const map: Record<string, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90,
  };
  if (map[lower]) {
    from = new Date(now.getTime() - map[lower] * 24 * 3600 * 1000);
  } else if (lower === '6m') {
    from = new Date(now);
    from.setMonth(from.getMonth() - 6);
  } else if (lower === '12m') {
    from = new Date(now);
    from.setFullYear(from.getFullYear() - 1);
  } else if (lower === 'ytd') {
    from = new Date(now.getFullYear(), 0, 1);
  } else {
    // try ISO date range: 2024-01-01..2024-03-01
    const parts = lower.split('..');
    if (parts.length === 2) {
      const f = new Date(parts[0]);
      const t = new Date(parts[1]);
      if (!isNaN(f.getTime()) && !isNaN(t.getTime())) return { from: f, to: t };
    }
    // fallback 30d
    from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
  }
  return { from, to: now };
}

function getCacheKey(key: string, params: Record<string, unknown>) {
  const base = `analytics:${key}`;
  const suffix = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${Array.isArray(v) ? v.join(',') : v}`)
    .join('&');
  return `${base}:${suffix}`;
}

const DEFAULT_TTL = parseInt(process.env.ANALYTICS_CACHE_TTL || '30', 10); // seconds

export class AnalyticsService {
  private static instance: AnalyticsService;
  private redis?: RedisService;

  private constructor() {
    try {
      this.redis = RedisService.getInstance();
    } catch (e) {
      logger.warn('RedisService not initialized; analytics caching disabled');
    }
  }

  static getInstance(): AnalyticsService {
    if (!this.instance) this.instance = new AnalyticsService();
    return this.instance;
  }

  private async getOrSetCache<T>(key: string, fetcher: () => Promise<T>, ttlSec: number = DEFAULT_TTL): Promise<T> {
    try {
      if (this.redis && (await this.redis.exists(key))) {
        const cached = await this.redis.get(key);
        if (cached) return JSON.parse(cached) as T;
      }
    } catch (e) {
      logger.warn('Analytics cache read failed', { key, error: (e as Error).message });
    }

    const value = await fetcher();
    try {
      if (this.redis) await this.redis.set(key, JSON.stringify(value), ttlSec);
    } catch (e) {
      logger.warn('Analytics cache write failed', { key, error: (e as Error).message });
    }
    return value;
  }

  async getExecutiveKPIs(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('executive-kpis', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      // Placeholder using current mocked structure; later replace with DB/integration aggregations.
      return {
        revenue: 2400000,
        growthRate: 12.5,
        targetProgress: 94,
        patients: 18245,
        efficiency: 95.1,
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  async getRevenueTrends(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('revenue-trends', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      return {
        monthlyData: [
          { month: 'Jan', revenue: 180000, target: 200000, growth: 5.2 },
          { month: 'Feb', revenue: 195000, target: 205000, growth: 8.0 },
          { month: 'Mar', revenue: 210000, target: 210000, growth: 9.1 },
          { month: 'Apr', revenue: 205000, target: 215000, growth: 6.9 },
          { month: 'May', revenue: 215000, target: 218000, growth: 8.3 },
          { month: 'Jun', revenue: 225000, target: 220000, growth: 4.7 }
        ],
        summary: {
          ytdRevenue: 2400000,
          growthRate: 12.5,
          targetProgress: 94,
          bestMonth: 'Jun',
          projectedTotal: 3200000
        },
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  async getLocationPerformance(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('location-performance', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      return {
        locations: [
          { id: 'loc-1', name: 'Downtown', revenue: 420000, revenueChange: 8.2, patients: 2847, patientChange: 5.1, efficiency: 96.2, status: 'excellent' },
          { id: 'loc-2', name: 'Westside', revenue: 385000, revenueChange: 3.4, patients: 2634, patientChange: 0.8, efficiency: 94.8, status: 'good' },
          { id: 'loc-3', name: 'Northgate', revenue: 362000, revenueChange: -2.1, patients: 2491, patientChange: -1.2, efficiency: 89.3, status: 'warning' }
        ],
        summary: { bestPerformer: 'Downtown', needsAttention: 'Northgate', totalRevenue: 1167000, avgEfficiency: 93.4 },
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  async getManagerMetrics(practiceId: string, date?: string) {
    const key = getCacheKey('manager-metrics', { practiceId, date: date || 'today' });
    return this.getOrSetCache(key, async () => ({
      todaysPerformance: {
        appointments: { scheduled: 32, completed: 28, pending: 4, conflicts: 2 },
        revenue: { current: 8420, goal: 9500, percentage: 88.6 },
        staff: { present: 10, total: 12, utilization: 91.7, remote: 2 }
      },
      alerts: [
        { type: 'conflict', message: '2 Schedule conflicts in Room 2' },
        { type: 'confirmation', message: '3 Appointment confirmations needed' },
        { type: 'prescription', message: '1 Prescription renewal required' }
      ],
      integrationHealth: {
        dentrix: { status: 'connected', lastSync: new Date().toISOString() },
        eaglesoft: { status: 'connected', lastSync: new Date().toISOString() },
        adp: { status: 'syncing', lastSync: new Date(Date.now() - 300000).toISOString() },
        dentalintel: { status: 'connected', lastSync: new Date().toISOString() }
      }
    }));
  }

  async getClinicalMetrics(providerId: string, dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('clinical-metrics', { providerId, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => ({
      treatmentMetrics: {
        successRate: 94.8,
        patientsThisMonth: 156,
        avgTreatmentTime: 28,
        patientSatisfaction: 4.9
      },
      treatmentOutcomes: {
        preventiveCare: { successRate: 92, volume: 45 },
        restorative: { successRate: 88, volume: 32 },
        surgical: { successRate: 95, volume: 18 }
      },
      efficiency: { chairUtilization: 85.2, ontimePerformance: 91.8, treatmentCompletion: 96.4 },
      timeframe: { from: from.toISOString(), to: to.toISOString() }
    }));
  }

  async getIntegrationStatus() {
    const key = 'analytics:integration-status';
    return this.getOrSetCache(key, async () => ({
      dentrix: { status: 'connected', health: 'healthy', dataPoints: ['patients', 'appointments'] },
      dentalintel: { status: 'connected', health: 'healthy', dataPoints: ['analytics', 'benchmarks'] },
      adp: { status: 'syncing', health: 'warning', dataPoints: ['payroll', 'productivity'] },
      eaglesoft: { status: 'connected', health: 'healthy', dataPoints: ['financials', 'billing'] }
    }), DEFAULT_TTL);
  }
}

export function parsePracticeIds(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(i => String(i).split(',')).map(s => s.trim()).filter(Boolean);
  return String(input).split(',').map(s => s.trim()).filter(Boolean);
}
