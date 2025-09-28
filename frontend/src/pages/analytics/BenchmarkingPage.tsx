import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const BenchmarkingPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const practiceIds = (user?.practices || []).map((p: any) => p.id);
        const res = await analyticsAPI.getBenchmarking(practiceIds, '90d');
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Benchmarking</h3>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-gray-500">Loading…</div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500">Peer Avg Utilization</div>
                <div className="text-xl font-semibold">{data?.peerAverages?.scheduleUtilization}%</div>
              </div>
              <div>
                <div className="text-gray-500">Peer Avg Staff Util</div>
                <div className="text-xl font-semibold">{data?.peerAverages?.staffUtilization}%</div>
              </div>
              <div>
                <div className="text-gray-500">Peer Bench Score</div>
                <div className="text-xl font-semibold">{data?.peerAverages?.benchmarkScore}</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="p-2">Location</th>
                    <th className="p-2">Revenue</th>
                    <th className="p-2">Utilization</th>
                    <th className="p-2">Staff Util</th>
                    <th className="p-2">Benchmark</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.locations?.map((l: any) => (
                    <tr key={l.id} className="border-t">
                      <td className="p-2">{l.id}</td>
                      <td className="p-2">${(l.revenue || 0).toLocaleString()}</td>
                      <td className="p-2">{l.scheduleUtilization}%</td>
                      <td className="p-2">{l.staffUtilization}%</td>
                      <td className="p-2">{l.benchmarkScore}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BenchmarkingPage;
