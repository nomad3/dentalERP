import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const RetentionCohortsPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const practiceIds = (user?.practices || []).map((p: any) => p.id);
        const res = await analyticsAPI.getRetentionCohorts(practiceIds, 6);
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
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Retention Cohorts</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-500 font-medium p-2">Cohort</th>
                  {[0,1,2,3,4,5].map(i => (
                    <th key={i} className="text-right text-gray-500 font-medium p-2">M+{i}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.cohorts?.map((c: any) => (
                  <tr key={c.cohort} className="border-t">
                    <td className="p-2 font-medium text-gray-900">{c.cohort}</td>
                    {c.retained.map((v: number, idx: number) => (
                      <td key={idx} className="p-2 text-right">{v}%</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-xs text-gray-500 mt-3">Synthetic cohorts for demo</p>
      </div>
    </div>
  );
};

export default RetentionCohortsPage;
