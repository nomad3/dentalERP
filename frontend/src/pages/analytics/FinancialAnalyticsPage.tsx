import React from 'react';

const FinancialAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Collections & Claims</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Insurance claims, AR aging, collections (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Eaglesoft + Billing</p>
        </div>

        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profitability</h3>
          <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Revenue minus costs, margins by location (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Financial integrations</p>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalyticsPage;

