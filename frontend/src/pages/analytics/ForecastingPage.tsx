import React from 'react';

const ForecastingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Forecasting</h3>
        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
          <span className="text-gray-500 text-sm">Projected revenue, patient volume, staffing (placeholder)</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">Inputs: historicals + growth targets</p>
      </div>
    </div>
  );
};

export default ForecastingPage;

