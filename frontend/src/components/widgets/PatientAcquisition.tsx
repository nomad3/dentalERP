import React from 'react';

const PatientAcquisition: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Patient Acquisition</h3>
          <p className="text-sm text-gray-600">New patient trends and conversion metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">347</div>
          <div className="text-xs text-gray-500">New Patients</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">1,205</div>
          <div className="text-xs text-gray-500">Returning</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">89</div>
          <div className="text-xs text-gray-500">Referrals</div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Marketing ROI:</span>
          <span className="font-semibold text-green-600">3.2x</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Conversion Rate:</span>
          <span className="font-semibold text-primary-600">68.4%</span>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        📊 Data from DentalIntel marketing analytics and Dentrix patient records
      </div>
    </div>
  );
};

export default PatientAcquisition;
