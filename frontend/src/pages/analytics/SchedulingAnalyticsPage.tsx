import React from 'react';

const SchedulingAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Utilization</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Chair time, provider utilization (placeholder)</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No-shows & Cancellations</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Rates, causes, trends (placeholder)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulingAnalyticsPage;

