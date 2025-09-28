import React from 'react';

const ClinicalAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Treatment Analytics</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Procedures by type, completion rates (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Dentrix clinical records</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Clinical Efficiency</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Chair utilization, on-time, throughput (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Scheduling + completions</p>
        </div>
      </div>
    </div>
  );
};

export default ClinicalAnalyticsPage;

