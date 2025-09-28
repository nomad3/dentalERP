import React from 'react';

const RetentionCohortsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Retention Cohorts</h3>
        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center">
          <span className="text-gray-500 text-sm">Cohort waterfall, patient retention by month (placeholder)</span>
        </div>
        <p className="text-xs text-gray-500 mt-3">Data source: Patient history + visits</p>
      </div>
    </div>
  );
};

export default RetentionCohortsPage;

