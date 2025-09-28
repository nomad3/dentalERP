import React from 'react';
import PatientAcquisition from '../../components/widgets/PatientAcquisition';

const PatientAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientAcquisition />
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Recall & Retention</h3>
          <div className="h-40 bg-gray-50 rounded-md flex items-center justify-center">
            <span className="text-gray-500 text-sm">Recall rates, returning patient cohorts (placeholder)</span>
          </div>
          <p className="text-xs text-gray-500 mt-3">Data source: Dentrix + DentalIntel</p>
        </div>
      </div>
    </div>
  );
};

export default PatientAnalyticsPage;

