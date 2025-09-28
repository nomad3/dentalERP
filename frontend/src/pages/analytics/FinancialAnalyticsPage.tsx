import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const FinancialAnalyticsPage: React.FC = () => {
  const user = useAuthStore(s => s.user);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const practiceIds = (user?.practices || []).map((p: any) => p.id);
        const res = await analyticsAPI.getFinancialOverview(practiceIds, '90d');
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Collections & Claims</h3>
          {loading ? (
            <div className="h-32 flex items-center justify-center text-gray-500">Loading…</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Collections (90d)</div>
                  <div className="text-xl font-semibold text-green-600">${(data?.collectionsTotal || 0).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-500">Claims Approval</div>
                  <div className="text-xl font-semibold">{data?.claims?.approvalRate || 0}%</div>
                  <div className="text-xs text-gray-500">Submitted {data?.claims?.submitted} • Denied {data?.claims?.denied}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-900 mb-1">AR Aging</div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-gray-50 rounded">Current<br/><span className="font-semibold">${(data?.arBuckets?.current || 0).toLocaleString()}</span></div>
                  <div className="p-2 bg-gray-50 rounded">30d<br/><span className="font-semibold">${(data?.arBuckets?.['30'] || 0).toLocaleString()}</span></div>
                  <div className="p-2 bg-gray-50 rounded">60d<br/><span className="font-semibold">${(data?.arBuckets?.['60'] || 0).toLocaleString()}</span></div>
                  <div className="p-2 bg-gray-50 rounded">90d<br/><span className="font-semibold">${(data?.arBuckets?.['90'] || 0).toLocaleString()}</span></div>
                </div>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-3">Data: synthetic demo from BI metrics</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profitability</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Revenue minus costs (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Financial integrations</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalyticsPage;
