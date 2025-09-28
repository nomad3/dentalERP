import React from 'react';
import RevenueChart from '../../components/widgets/RevenueChart';
import LocationPerformance from '../../components/widgets/LocationPerformance';

const RevenueAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <LocationPerformance />
      </div>

      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
          <span className="text-xs text-gray-500">Revenue & performance by location</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Explore top-line revenue trends and compare locations for period-over-period performance.
        </p>
      </div>
    </div>
  );
};

export default RevenueAnalyticsPage;

