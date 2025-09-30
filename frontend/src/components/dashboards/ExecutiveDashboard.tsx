import React from 'react';
import { Link } from 'react-router-dom';
import { useExecutiveKPIs, useIntegrationStatus } from '../../hooks/useAnalytics';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';
import ExecutiveKPIGrid from '../dashboard/ExecutiveKPIGrid';
import { LoadingSpinner } from '../ui/LoadingSpinner';

const ExecutiveDashboard: React.FC = () => {
  const { data: kpiData, isLoading: kpiLoading, error: kpiError } = useExecutiveKPIs('30d');
  const { data: integrationData, isLoading: integrationLoading } = useIntegrationStatus();

  if (kpiLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading executive analytics...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600">Strategic insights and multi-location performance analytics</p>
        {!!kpiError && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-amber-800 text-sm">
              We couldn’t load analytics from integrations. The dashboard shows blanks until connections are set up.
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option>📅 Last 30 Days</option>
            <option>📅 Last 90 Days</option>
            <option>📅 Last 12 Months</option>
          </select>
          {/* Multi-practice selector */}
          {(() => {
            const practices = useAuthStore.getState().practices || [];
            const selected = useDashboardStore.getState().selectedPracticeIds;
            const setSelected = useDashboardStore.getState().setSelectedPracticeIds;
            const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
              const options = Array.from(e.target.selectedOptions).map(o => o.value);
              setSelected(options);
            };
            return (
              <select multiple value={selected.length ? selected : practices.map(p => p.id)} onChange={onChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 min-w-[200px]"
                aria-label="Select one or more practices"
                title="Select one or more practices"
              >
                {practices.map((p) => (
                  <option key={p.id} value={p.id}>📍 {p.name}</option>
                ))}
              </select>
            );
          })()}
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            🔍 Compare Periods
          </button>
        </div>
      </div>

      {/* KPI Row (drag-and-drop) */}
      {(() => {
        const practices = useAuthStore.getState().practices || [];
        const selected = useDashboardStore.getState().selectedPracticeIds.length
          ? useDashboardStore.getState().selectedPracticeIds
          : (practices.map(p => p.id));
        return <ExecutiveKPIGrid practiceIds={selected} />;
      })()}

      {/* Highlights and quick links (no duplication with Analytics pages) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Key Highlights</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• Revenue up 6.2% vs last 30 days</li>
            <li>• Top location: Northgate (+9.4%)</li>
            <li>• Staff utilization 92.1% (target 90%)</li>
            <li>• New patients +12.7% MoM</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Goals & Watchlist</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• QTD Revenue Goal: 78% achieved</li>
            <li>• Locations under target: 1</li>
            <li>• Collections cycle time: 32 days</li>
            <li>• No-show rate: 4.1%</li>
          </ul>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">Dive deeper into domain-specific views.</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <Link to="/analytics/revenue" className="px-3 py-2 border rounded hover:bg-gray-50">Revenue</Link>
            <Link to="/analytics/patients" className="px-3 py-2 border rounded hover:bg-gray-50">Patients</Link>
            <Link to="/analytics/staff" className="px-3 py-2 border rounded hover:bg-gray-50">Staff</Link>
            <Link to="/analytics/clinical" className="px-3 py-2 border rounded hover:bg-gray-50">Clinical</Link>
            <Link to="/analytics/financial" className="px-3 py-2 border rounded hover:bg-gray-50">Financial</Link>
            <Link to="/analytics/reports" className="px-3 py-2 border rounded hover:bg-gray-50">Reports</Link>
          </div>
        </div>
      </div>

      {/* Integration Status Footer */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
          {integrationLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="flex space-x-4">
              {integrationData?.data && Object.entries(integrationData.data).map(([system, info]: [string, any]) => {
                const statusColor = info.status === 'connected' ? 'bg-green-500' :
                                  info.status === 'syncing' ? 'bg-yellow-500' : 'bg-red-500';
                const statusIcon = info.status === 'connected' ? '🟢' :
                                 info.status === 'syncing' ? '🟡' : '🔴';

                return (
                  <div key={system} className="flex items-center space-x-2" title={`${system}: ${info.status}`}>
                    <div className={`w-3 h-3 ${statusColor} rounded-full`}></div>
                    <span className="text-sm text-gray-600 capitalize">{system}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {integrationData?.data && (
          <div className="mt-3 text-xs text-gray-500">
            Last updated: {new Date(integrationData.timestamp).toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
