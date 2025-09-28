import React from 'react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useIntegrationStatus } from '../../hooks/useAnalytics';

const IntegrationsPage: React.FC = () => {
  const { data: integrationData, isLoading, error, refetch } = useIntegrationStatus();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading integration status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Unable to load integration status</h3>
          <p className="text-red-600 text-sm mt-1">Please check system connectivity.</p>
          <button
            onClick={() => refetch()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const systems = integrationData?.data || {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integration Monitoring Dashboard</h1>
        <p className="text-gray-600">Real-time health monitoring for external dental software systems</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{integrationData?.summary?.connected || 3}</div>
          <div className="text-sm text-gray-600">Connected</div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{integrationData?.summary?.syncing || 1}</div>
          <div className="text-sm text-gray-600">Syncing</div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{integrationData?.summary?.offline || 0}</div>
          <div className="text-sm text-gray-600">Offline</div>
        </div>
        <div className="bg-white rounded-lg shadow border p-4 text-center">
          <div className="text-2xl font-bold text-primary-600">{integrationData?.summary?.total || 4}</div>
          <div className="text-sm text-gray-600">Total Systems</div>
        </div>
      </div>

      {/* Integration Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(systems).map(([systemName, systemData]: [string, any]) => {
          const statusColor = systemData.status === 'connected' ? 'green' :
                             systemData.status === 'syncing' ? 'yellow' : 'red';
          const statusIcon = systemData.status === 'connected' ? '🟢' :
                           systemData.status === 'syncing' ? '🟡' : '🔴';

          return (
            <div key={systemName} className="bg-white rounded-lg shadow border p-6">
              {/* System Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{statusIcon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">{systemName}</h3>
                    <p className="text-sm text-gray-600 capitalize">{systemData.status}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">Uptime</div>
                  <div className={`text-sm text-${statusColor}-600`}>{systemData.uptime}</div>
                </div>
              </div>

              {/* System Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Sync:</span>
                  <span className="font-medium">
                    {new Date(systemData.lastSync).toLocaleTimeString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Health:</span>
                  <span className={`font-medium text-${statusColor}-600 capitalize`}>
                    {systemData.health}
                  </span>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-2">Data Points:</div>
                  <div className="flex flex-wrap gap-1">
                    {systemData.dataPoints.map((point: string) => (
                      <span
                        key={point}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
                <button className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200">
                  Test Connection
                </button>
                <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                  View Logs
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Manual Ingestion CTA */}
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Need data without a live integration?</h3>
            <p className="text-sm text-gray-600">Upload CSV or PDF and we’ll parse it.</p>
          </div>
          <a href="/integrations/ingestion" className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200">
            Manual Ingestion
          </a>
        </div>
      </div>

      {/* BI Data Flow Visualization */}
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Intelligence Data Flow</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🦷</div>
            <div className="font-medium text-gray-900">Dentrix</div>
            <div className="text-xs text-gray-600 mt-1">Patient data → BI Analytics</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">DentalIntel</div>
            <div className="text-xs text-gray-600 mt-1">Analytics → Executive KPIs</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl mb-2">💼</div>
            <div className="font-medium text-gray-900">ADP</div>
            <div className="text-xs text-gray-600 mt-1">Staff data → Productivity metrics</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium text-gray-900">Eaglesoft</div>
            <div className="text-xs text-gray-600 mt-1">Financial data → Revenue analytics</div>
          </div>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
        >
          🔄 Refresh All Integrations
        </button>
      </div>
    </div>
  );
};

export default IntegrationsPage;
