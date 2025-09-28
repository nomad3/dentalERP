import React from 'react';
import { useExecutiveKPIs, useIntegrationStatus } from '../../hooks/useAnalytics';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import KPIWidget from '../widgets/KPIWidget';
import LocationPerformance from '../widgets/LocationPerformance';
import PatientAcquisition from '../widgets/PatientAcquisition';
import RevenueChart from '../widgets/RevenueChart';
import StaffProductivity from '../widgets/StaffProductivity';

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

  if (kpiError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Unable to load analytics data</h3>
          <p className="text-red-600 text-sm mt-1">
            Please check integration connections to Dentrix, DentalIntel, ADP, and Eaglesoft.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600">Strategic insights and multi-location performance analytics</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option>📅 Last 30 Days</option>
            <option>📅 Last 90 Days</option>
            <option>📅 Last 12 Months</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option>📍 All Locations</option>
            <option>📍 Downtown</option>
            <option>📍 Westside</option>
            <option>📍 Northgate</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            🔍 Compare Periods
          </button>
        </div>
      </div>

      {/* KPI Row (4 widgets) - Following wireframe specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Revenue"
          value={kpiData ? `$${(kpiData.data.totalRevenue.value / 1000000).toFixed(1)}M` : '$2.4M'}
          change={kpiData ? `${kpiData.data.totalRevenue.change > 0 ? '+' : ''}${kpiData.data.totalRevenue.change}%` : '+12.5%'}
          trend={kpiData?.data.totalRevenue.trend || 'up'}
          source={kpiData?.data.totalRevenue.source || 'Eaglesoft + DentalIntel'}
        />
        <KPIWidget
          title="Patient Volume"
          value={kpiData ? kpiData.data.patientVolume.value.toLocaleString() : '15,847'}
          change={kpiData ? `${kpiData.data.patientVolume.change > 0 ? '+' : ''}${kpiData.data.patientVolume.change}%` : '+8.3%'}
          trend={kpiData?.data.patientVolume.trend || 'up'}
          source={kpiData?.data.patientVolume.source || 'Dentrix + DentalIntel'}
        />
        <KPIWidget
          title="Appointment Efficiency"
          value={kpiData ? `${kpiData.data.appointmentEfficiency.value}%` : '94.2%'}
          change={kpiData ? `${kpiData.data.appointmentEfficiency.change > 0 ? '+' : ''}${kpiData.data.appointmentEfficiency.change}%` : '+2.1%'}
          trend={kpiData?.data.appointmentEfficiency.trend || 'up'}
          source={kpiData?.data.appointmentEfficiency.source || 'Dentrix + Scheduling'}
        />
        <KPIWidget
          title="Profit Margin"
          value={kpiData ? `${kpiData.data.profitMargin.value}%` : '28.3%'}
          change={kpiData ? `${kpiData.data.profitMargin.change > 0 ? '+' : ''}${kpiData.data.profitMargin.change}%` : '-0.8%'}
          trend={kpiData?.data.profitMargin.trend || 'down'}
          source={kpiData?.data.profitMargin.source || 'Eaglesoft + ADP'}
        />
      </div>

      {/* Main Analytics Row (2x2 widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <LocationPerformance />
        </div>
      </div>

      {/* Bottom Row (Analytics widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientAcquisition />
        <StaffProductivity />
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
