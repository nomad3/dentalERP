import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import KPIWidget from '../widgets/KPIWidget';
import DashboardGrid from './DashboardGrid';

type Props = { practiceIds: string[] };

const ExecutiveKPIGrid: React.FC<Props> = ({ practiceIds }) => {
  const user = useAuthStore(s => s.user);
  const currentPractice = useAuthStore(s => s.currentPractice);
  const { layout, widgets, loadLayout, saveLayout } = useDashboardStore();

  const effectivePracticeId = currentPractice?.id || user?.practiceIds?.[0];

  useEffect(() => {
    if (effectivePracticeId) {
      loadLayout(effectivePracticeId);
    }
  }, [effectivePracticeId]);

  const { data: kpiRes, refetch } = useQuery({
    queryKey: ['executive-kpis', practiceIds.sort().join(',')],
    queryFn: async () => analyticsAPI.getExecutiveKPIs(practiceIds, 'last_30_days'),
    staleTime: 30_000,
  });

  useEffect(() => {
    const handler = () => { refetch(); };
    window.addEventListener('analytics-update', handler as any);
    return () => window.removeEventListener('analytics-update', handler as any);
  }, [refetch]);

  const items = useMemo(() => {
    const order = layout?.length ? layout.map(l => l.id) : [
      'kpi_total_revenue', 'kpi_patient_volume', 'kpi_appointment_efficiency', 'kpi_profit_margin'
    ];

    const map: Record<string, React.ReactNode> = {
      kpi_total_revenue: (
        <KPIWidget
          title="Total Revenue"
          value={kpiRes ? `$${(kpiRes.data.totalRevenue.value / 1_000_000).toFixed(1)}M` : '—'}
          change={kpiRes ? `${kpiRes.data.totalRevenue.change > 0 ? '+' : ''}${kpiRes.data.totalRevenue.change}%` : '—'}
          trend={kpiRes?.data.totalRevenue.trend || 'neutral'}
          source={kpiRes?.data.totalRevenue.source || 'Eaglesoft + DentalIntel'}
        />
      ),
      kpi_patient_volume: (
        <KPIWidget
          title="Patient Volume"
          value={kpiRes ? kpiRes.data.patientVolume.value.toLocaleString() : '—'}
          change={kpiRes ? `${kpiRes.data.patientVolume.change > 0 ? '+' : ''}${kpiRes.data.patientVolume.change}%` : '—'}
          trend={kpiRes?.data.patientVolume.trend || 'neutral'}
          source={kpiRes?.data.patientVolume.source || 'Dentrix + DentalIntel'}
        />
      ),
      kpi_appointment_efficiency: (
        <KPIWidget
          title="Appointment Efficiency"
          value={kpiRes ? `${kpiRes.data.appointmentEfficiency.value}%` : '—'}
          change={kpiRes ? `${kpiRes.data.appointmentEfficiency.change > 0 ? '+' : ''}${kpiRes.data.appointmentEfficiency.change}%` : '—'}
          trend={kpiRes?.data.appointmentEfficiency.trend || 'neutral'}
          source={kpiRes?.data.appointmentEfficiency.source || 'Dentrix + Scheduling'}
        />
      ),
      kpi_profit_margin: (
        <KPIWidget
          title="Profit Margin"
          value={kpiRes ? `${kpiRes.data.profitMargin.value}%` : '—'}
          change={kpiRes ? `${kpiRes.data.profitMargin.change > 0 ? '+' : ''}${kpiRes.data.profitMargin.change}%` : '—'}
          trend={kpiRes?.data.profitMargin.trend || 'neutral'}
          source={kpiRes?.data.profitMargin.source || 'Eaglesoft + ADP'}
        />
      ),
    };

    return order
      .filter(id => id in map)
      .map(id => ({ id, content: map[id] }));
  }, [layout, kpiRes]);

  const handleReorder = async (newOrder: string[]) => {
    const nextLayout = newOrder.map(id => ({ id }));
    if (effectivePracticeId) {
      await saveLayout(effectivePracticeId, nextLayout, widgets || {});
    }
  };

  return (
    <DashboardGrid items={items} onReorder={handleReorder} />
  );
};

export default ExecutiveKPIGrid;
