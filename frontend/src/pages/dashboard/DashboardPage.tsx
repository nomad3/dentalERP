import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your dental practice management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">$2.4M</p>
          <p className="text-sm text-green-600">↑ 12.5% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Patient Volume</h3>
          <p className="text-3xl font-bold text-blue-600">15,847</p>
          <p className="text-sm text-green-600">↑ 8.3% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Efficiency</h3>
          <p className="text-3xl font-bold text-blue-600">94.2%</p>
          <p className="text-sm text-green-600">↑ 2.1% vs last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profit Margin</h3>
          <p className="text-3xl font-bold text-blue-600">28.3%</p>
          <p className="text-sm text-red-600">↓ 0.8% vs last month</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard widgets will be implemented here</h2>
        <p className="text-gray-600">
          This is where the customizable dashboard widgets will appear, including:
        </p>
        <ul className="list-disc list-inside mt-4 text-gray-600">
          <li>Revenue trends and analytics</li>
          <li>Multi-location performance comparison</li>
          <li>Patient acquisition metrics</li>
          <li>Staff productivity overview</li>
          <li>Integration status monitoring</li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardPage;
