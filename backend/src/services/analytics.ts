import { logger } from '../utils/logger';
import { RedisService } from './redis';
import { DatabaseService } from './database';
import * as schema from '../database/schema';
import { and, gte, lte, inArray } from 'drizzle-orm';

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
      const [fromStr, toStr] = parts as [string, string];
      const f = new Date(fromStr);
      const t = new Date(toStr);
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
      if (this.redis) {
        if (ttlSec && ttlSec > 0) {
          await this.redis.setex(key, ttlSec, JSON.stringify(value));
        } else {
          await this.redis.set(key, JSON.stringify(value));
        }
      }
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

  // Financial overview (AR buckets, collections, claims)
  async getFinancialOverview(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('financial-overview', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      const db = DatabaseService.getInstance().getDb();
      const where = and(
        practiceIds.length ? inArray(schema.biDailyMetrics.practiceId, practiceIds as any) : undefined,
        gte(schema.biDailyMetrics.date, from),
        lte(schema.biDailyMetrics.date, to),
      );
      const rows = await db
        .select({
          collectionsAmount: schema.biDailyMetrics.collectionsAmount,
          arCurrent: schema.biDailyMetrics.arCurrent,
          ar30: schema.biDailyMetrics.ar30,
          ar60: schema.biDailyMetrics.ar60,
          ar90: schema.biDailyMetrics.ar90,
          claimsSubmitted: schema.biDailyMetrics.claimsSubmitted,
          claimsDenied: schema.biDailyMetrics.claimsDenied,
        })
        .from(schema.biDailyMetrics)
        .where(where as any);

      const agg = rows.reduce((a: { collections: number; ar: { current: number; '30': number; '60': number; '90': number }; claims: { submitted: number; denied: number } }, r: any) => {
        a.collections += r.collectionsAmount || 0;
        a.ar.current = r.arCurrent || a.ar.current;
        a.ar['30'] = r.ar30 || a.ar['30'];
        a.ar['60'] = r.ar60 || a.ar['60'];
        a.ar['90'] = r.ar90 || a.ar['90'];
        a.claims.submitted += r.claimsSubmitted || 0;
        a.claims.denied += r.claimsDenied || 0;
        return a;
      }, { collections: 0, ar: { current: 0, '30': 0, '60': 0, '90': 0 }, claims: { submitted: 0, denied: 0 } } as any);
      const approvalRate = agg.claims.submitted ? Math.round(((agg.claims.submitted - agg.claims.denied) / agg.claims.submitted) * 1000)/10 : 0;
      return {
        arBuckets: agg.ar,
        collectionsTotal: agg.collections,
        claims: { ...agg.claims, approvalRate },
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  // Scheduling/operations overview (utilization, no-shows, cancellations, wait time)
  async getSchedulingOverview(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('scheduling-overview', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      const db = DatabaseService.getInstance().getDb();
      const where = and(
        practiceIds.length ? inArray(schema.biDailyMetrics.practiceId, practiceIds as any) : undefined,
        gte(schema.biDailyMetrics.date, from),
        lte(schema.biDailyMetrics.date, to),
      );
      const rows = await db
        .select({
          scheduleUtilization: schema.biDailyMetrics.scheduleUtilization,
          noShows: schema.biDailyMetrics.noShows,
          cancellations: schema.biDailyMetrics.cancellations,
          avgWaitTime: schema.biDailyMetrics.avgWaitTime,
        })
        .from(schema.biDailyMetrics)
        .where(where as any);
      const n = rows.length || 1;
      const totals = rows.reduce((a: { utilization: number; noShows: number; cancellations: number; wait: number }, r: any) => ({
        utilization: a.utilization + (r.scheduleUtilization || 0),
        noShows: a.noShows + (r.noShows || 0),
        cancellations: a.cancellations + (r.cancellations || 0),
        wait: a.wait + (r.avgWaitTime || 0),
      }), { utilization: 0, noShows: 0, cancellations: 0, wait: 0 });
      return {
        scheduleUtilization: Math.round((totals.utilization / n) * 10)/10,
        noShows: totals.noShows,
        cancellations: totals.cancellations,
        avgWaitTime: Math.round((totals.wait / n) * 10)/10,
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  // Synthetic retention cohorts (6 cohorts, 6 months trail)
  async getRetentionCohorts(practiceIds: string[] = [], months = 6) {
    const key = getCacheKey('retention-cohorts', { practiceIds, months });
    return this.getOrSetCache(key, async () => {
      const now = new Date();
      const cohorts = [] as any[];
      for (let i = months; i >= 1; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        // start at 100% and decay 8-15% per step
        const arr = [100];
        for (let k = 1; k < months; k++) {
          const drop = 8 + Math.floor(Math.random()*7);
          const prev = arr[k-1] ?? 100;
          arr[k] = Math.max(20, Math.round(prev * (1 - drop/100)));
        }
        cohorts.push({ cohort: label, retained: arr });
      }
      return { cohorts };
    });
  }

  // Benchmarking against peer locations
  async getBenchmarking(practiceIds: string[] = [], dateRange?: DateRange) {
    const { from, to } = parseDateRange(dateRange);
    const key = getCacheKey('benchmarking', { practiceIds, from: from.toISOString(), to: to.toISOString() });
    return this.getOrSetCache(key, async () => {
      const db = DatabaseService.getInstance().getDb();
      const where = and(
        practiceIds.length ? inArray(schema.biDailyMetrics.practiceId, practiceIds as any) : undefined,
        gte(schema.biDailyMetrics.date, from),
        lte(schema.biDailyMetrics.date, to),
      );
      const rows = await db
        .select({
          locationId: schema.biDailyMetrics.locationId,
          revenue: schema.biDailyMetrics.revenue,
          scheduleUtilization: schema.biDailyMetrics.scheduleUtilization,
          staffUtilization: schema.biDailyMetrics.staffUtilization,
          benchmarkScore: schema.biDailyMetrics.benchmarkScore,
        })
        .from(schema.biDailyMetrics)
        .where(where as any);

      const byLoc: Record<string, any> = {};
      for (const r of rows) {
        const key = String(r.locationId || 'all');
        byLoc[key] = byLoc[key] || { revenue: 0, util: 0, sutil: 0, bench: 0, n: 0 };
        byLoc[key].revenue += r.revenue || 0;
        byLoc[key].util += r.scheduleUtilization || 0;
        byLoc[key].sutil += r.staffUtilization || 0;
        byLoc[key].bench += r.benchmarkScore || 0;
        byLoc[key].n += 1;
      }
      const locations = Object.entries(byLoc).map(([locId, v]) => ({
        id: locId,
        revenue: v.revenue,
        scheduleUtilization: Math.round((v.util / v.n) * 10)/10,
        staffUtilization: Math.round((v.sutil / v.n) * 10)/10,
        benchmarkScore: Math.round((v.bench / v.n) * 10)/10,
      }));
      const peerAvg = locations.reduce((a, l) => ({
        revenue: a.revenue + l.revenue,
        scheduleUtilization: a.scheduleUtilization + l.scheduleUtilization,
        staffUtilization: a.staffUtilization + l.staffUtilization,
        benchmarkScore: a.benchmarkScore + l.benchmarkScore,
      }), { revenue: 0, scheduleUtilization: 0, staffUtilization: 0, benchmarkScore: 0 });
      const count = Math.max(1, locations.length);
      return {
        locations,
        peerAverages: {
          revenue: peerAvg.revenue,
          scheduleUtilization: Math.round((peerAvg.scheduleUtilization / count) * 10)/10,
          staffUtilization: Math.round((peerAvg.staffUtilization / count) * 10)/10,
          benchmarkScore: Math.round((peerAvg.benchmarkScore / count) * 10)/10,
        },
        timeframe: { from: from.toISOString(), to: to.toISOString() }
      };
    });
  }

  // Simple forecasting based on last 30d vs previous 30d growth
  async getForecasting(practiceIds: string[] = []) {
    const key = getCacheKey('forecasting', { practiceIds });
    return this.getOrSetCache(key, async () => {
      const db = DatabaseService.getInstance().getDb();
      const now = new Date();
      const from1 = new Date(now.getTime() - 30*24*3600*1000);
      const from2 = new Date(now.getTime() - 60*24*3600*1000);
      const rows1 = await db.select({ revenue: schema.biDailyMetrics.revenue, newPatients: schema.biDailyMetrics.newPatients, returningPatients: schema.biDailyMetrics.returningPatients })
        .from(schema.biDailyMetrics)
        .where(and(
          practiceIds.length ? inArray(schema.biDailyMetrics.practiceId, practiceIds as any) : undefined,
          gte(schema.biDailyMetrics.date, from1),
          lte(schema.biDailyMetrics.date, now),
        ) as any);
      const rows2 = await db.select({ revenue: schema.biDailyMetrics.revenue, newPatients: schema.biDailyMetrics.newPatients, returningPatients: schema.biDailyMetrics.returningPatients })
        .from(schema.biDailyMetrics)
        .where(and(
          practiceIds.length ? inArray(schema.biDailyMetrics.practiceId, practiceIds as any) : undefined,
          gte(schema.biDailyMetrics.date, from2),
          lte(schema.biDailyMetrics.date, from1),
        ) as any);
      const sum = (arr: any[], k: string) => arr.reduce((a, r) => a + (r[k] || 0), 0);
      const rev1 = sum(rows1, 'revenue');
      const rev2 = sum(rows2, 'revenue');
      const pts1 = sum(rows1, 'newPatients') + sum(rows1, 'returningPatients');
      const pts2 = sum(rows2, 'newPatients') + sum(rows2, 'returningPatients');
      const revGrowth = rev2 ? (rev1 - rev2) / rev2 : 0.05;
      const ptsGrowth = pts2 ? (pts1 - pts2) / pts2 : 0.05;
      return {
        projectedRevenueNext30d: Math.round(rev1 * (1 + revGrowth)),
        projectedPatientsNext30d: Math.round(pts1 * (1 + ptsGrowth)),
        growthAssumptions: { revenueGrowth: Math.round(revGrowth*1000)/10, patientsGrowth: Math.round(ptsGrowth*1000)/10 },
        timeframe: { last30d: from1.toISOString() + '..' + now.toISOString() }
      };
    });
  }
}

export function parsePracticeIds(input?: string | string[]): string[] {
  if (!input) return [];
  if (Array.isArray(input)) return input.flatMap(i => String(i).split(',')).map(s => s.trim()).filter(Boolean);
  return String(input).split(',').map(s => s.trim()).filter(Boolean);
}
