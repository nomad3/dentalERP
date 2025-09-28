import React from 'react';
import StaffProductivity from '../../components/widgets/StaffProductivity';

const StaffAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaffProductivity />
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Utilization & Payroll Efficiency</h3>
          <div className="h-40 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">ADP utilization, revenue per hour (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: ADP + Scheduling</p>
        </div>
      </div>
    </div>
  );
};

export default StaffAnalyticsPage;

