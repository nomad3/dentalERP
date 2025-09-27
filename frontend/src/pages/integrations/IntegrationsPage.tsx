import React from 'react';

const IntegrationsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">System Integrations</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-2">Dentrix</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-2">DentalIntel</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-2">ADP</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Syncing</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow border p-6">
          <h3 className="text-lg font-semibold mb-2">Eaglesoft</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
