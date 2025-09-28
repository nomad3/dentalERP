import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const SchedulingAnalyticsPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const practiceIds = (user?.practices || []).map((p: any) => p.id);
        const res = await analyticsAPI.getSchedulingOverview(practiceIds, '30d');
        if (mounted) setData(res.data);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [user]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Utilization</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="text-gray-500">Average utilization (30d)</div>
              <div className="text-3xl font-semibold text-primary-600">{data?.scheduleUtilization || 0}%</div>
              <div className="text-gray-500">Average wait time</div>
              <div className="text-xl">{data?.avgWaitTime || 0} min</div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No-shows & Cancellations</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500">Loading…</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">No-shows (30d)</div>
                <div className="text-2xl font-semibold text-red-600">{data?.noShows || 0}</div>
              </div>
              <div>
                <div className="text-gray-500">Cancellations (30d)</div>
                <div className="text-2xl font-semibold text-yellow-600">{data?.cancellations || 0}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulingAnalyticsPage;
