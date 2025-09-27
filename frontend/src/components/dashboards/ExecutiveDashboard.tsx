import React from 'react';
import KPIWidget from '../widgets/KPIWidget';
import LocationPerformance from '../widgets/LocationPerformance';
import PatientAcquisition from '../widgets/PatientAcquisition';
import RevenueChart from '../widgets/RevenueChart';
import StaffProductivity from '../widgets/StaffProductivity';

const ExecutiveDashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Executive Dashboard</h1>
        <p className="text-gray-600">Strategic insights and multi-location performance analytics</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option>📅 Last 30 Days</option>
            <option>📅 Last 90 Days</option>
            <option>📅 Last 12 Months</option>
          </select>
          <select className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500">
            <option>📍 All Locations</option>
            <option>📍 Downtown</option>
            <option>📍 Westside</option>
            <option>📍 Northgate</option>
          </select>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            🔍 Compare Periods
          </button>
        </div>
      </div>

      {/* KPI Row (4 widgets) - Following wireframe specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIWidget
          title="Total Revenue"
          value="$2.4M"
          change="+12.5%"
          trend="up"
          source="Eaglesoft + DentalIntel"
        />
        <KPIWidget
          title="Patient Volume"
          value="15,847"
          change="+8.3%"
          trend="up"
          source="Dentrix + DentalIntel"
        />
        <KPIWidget
          title="Appointment Efficiency"
          value="94.2%"
          change="+2.1%"
          trend="up"
          source="Dentrix + Scheduling"
        />
        <KPIWidget
          title="Profit Margin"
          value="28.3%"
          change="-0.8%"
          trend="down"
          source="Eaglesoft + ADP"
        />
      </div>

      {/* Main Analytics Row (2x2 widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-1">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <LocationPerformance />
        </div>
      </div>

      {/* Bottom Row (Analytics widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PatientAcquisition />
        <StaffProductivity />
      </div>

      {/* Integration Status Footer */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Integration Status</h3>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Dentrix</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">DentalIntel</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600">ADP</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Eaglesoft</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
