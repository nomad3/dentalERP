import React from 'react';

const RevenueChart: React.FC = () => {
  // Mock data - in real implementation, this would come from DentalIntel + Eaglesoft
  const mockData = [
    { month: 'Jan', revenue: 180000, target: 200000 },
    { month: 'Feb', revenue: 195000, target: 200000 },
    { month: 'Mar', revenue: 207000, target: 200000 },
    { month: 'Apr', revenue: 198000, target: 210000 },
    { month: 'May', revenue: 215000, target: 210000 },
    { month: 'Jun', revenue: 225000, target: 220000 }
  ];

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
          <p className="text-sm text-gray-600">Monthly performance across all locations</p>
        </div>
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-gray-600" title="Refresh">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600" title="Options">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Chart Area - Simplified representation */}
      <div className="h-64 relative bg-gray-50 rounded-lg p-4">
        <div className="h-full flex items-end justify-between space-x-1">
          {mockData.map((data, index) => {
            const percentage = (data.revenue / 250000) * 100;
            const targetPercentage = (data.target / 250000) * 100;

            return (
              <div key={data.month} className="flex-1 flex flex-col items-center">
                <div className="w-full relative h-48 flex flex-col justify-end">
                  {/* Target line */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-gray-400"
                    style={{ bottom: `${targetPercentage}%` }}
                  />
                  {/* Revenue bar */}
                  <div
                    className="w-full bg-primary-500 rounded-t transition-all hover:bg-primary-600"
                    style={{ height: `${percentage}%` }}
                    title={`${data.month}: $${(data.revenue / 1000).toFixed(0)}K`}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-600 font-medium">{data.month}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart Summary */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">YTD Revenue</p>
          <p className="text-lg font-semibold text-gray-900">$2.4M</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Growth Rate</p>
          <p className="text-lg font-semibold text-green-600">+12.5%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Target Progress</p>
          <p className="text-lg font-semibold text-primary-600">94%</p>
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          📊 Data aggregated from Eaglesoft financial reports and DentalIntel analytics
        </p>
      </div>
    </div>
  );
};

export default RevenueChart;
