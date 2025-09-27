import React from 'react';

interface LocationData {
  name: string;
  revenue: string;
  revenueChange: number;
  patients: number;
  patientChange: number;
  efficiency: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
}

const LocationPerformance: React.FC = () => {
  // Mock data - in real implementation, this would aggregate from all external systems
  const locations: LocationData[] = [
    {
      name: 'Downtown',
      revenue: '$420K',
      revenueChange: 8.2,
      patients: 2847,
      patientChange: 5.1,
      efficiency: 96.2,
      status: 'excellent'
    },
    {
      name: 'Westside',
      revenue: '$385K',
      revenueChange: 3.4,
      patients: 2634,
      patientChange: 0.8,
      efficiency: 94.8,
      status: 'good'
    },
    {
      name: 'Northgate',
      revenue: '$362K',
      revenueChange: -2.1,
      patients: 2491,
      patientChange: -1.2,
      efficiency: 89.3,
      status: 'warning'
    },
    {
      name: 'Riverside',
      revenue: '$341K',
      revenueChange: 4.7,
      patients: 2156,
      patientChange: 2.3,
      efficiency: 91.7,
      status: 'good'
    },
    {
      name: 'Suburban',
      revenue: '$298K',
      revenueChange: 0.1,
      patients: 1983,
      patientChange: 0.5,
      efficiency: 93.1,
      status: 'good'
    }
  ];

  const getStatusIndicator = (status: LocationData['status']) => {
    const indicators = {
      excellent: { color: 'bg-green-500', text: '🟢' },
      good: { color: 'bg-blue-500', text: '🟡' },
      warning: { color: 'bg-yellow-500', text: '🟡' },
      poor: { color: 'bg-red-500', text: '🔴' }
    };
    return indicators[status];
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return '↑';
    if (change < 0) return '↓';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      {/* Widget Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Multi-Location Performance</h3>
          <p className="text-sm text-gray-600">Comparative analytics across practice locations</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Filter
          </button>
          <button className="px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200">
            Export
          </button>
        </div>
      </div>

      {/* Performance Table */}
      <div className="overflow-hidden">
        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-5 gap-4 px-3 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-700 uppercase tracking-wide">
            <div>Location</div>
            <div className="text-center">Revenue</div>
            <div className="text-center">Patients</div>
            <div className="text-center">Efficiency</div>
            <div className="text-center">Status</div>
          </div>

          {/* Location Rows */}
          {locations.map((location, index) => (
            <div
              key={location.name}
              className="grid grid-cols-5 gap-4 px-3 py-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Location Name */}
              <div className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                <span className="font-medium text-gray-900">{location.name}</span>
              </div>

              {/* Revenue */}
              <div className="text-center">
                <div className="font-semibold text-gray-900">{location.revenue}</div>
                <div className={`text-xs ${getChangeColor(location.revenueChange)}`}>
                  {getChangeIcon(location.revenueChange)} {Math.abs(location.revenueChange)}%
                </div>
              </div>

              {/* Patients */}
              <div className="text-center">
                <div className="font-semibold text-gray-900">{location.patients.toLocaleString()}</div>
                <div className={`text-xs ${getChangeColor(location.patientChange)}`}>
                  {getChangeIcon(location.patientChange)} {Math.abs(location.patientChange)}%
                </div>
              </div>

              {/* Efficiency */}
              <div className="text-center">
                <div className="font-semibold text-gray-900">{location.efficiency}%</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${location.efficiency}%` }}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <span className="text-sm">{getStatusIndicator(location.status).text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          🎯 <span className="font-medium">Best Performer:</span> Downtown
        </div>
        <div className="text-sm text-gray-600">
          ⚠️ <span className="font-medium">Needs Attention:</span> Northgate
        </div>
      </div>

      {/* Data Sources */}
      <div className="mt-2">
        <p className="text-xs text-gray-500">
          📊 Integrated data from Dentrix appointments, Eaglesoft financials, and DentalIntel benchmarks
        </p>
      </div>
    </div>
  );
};

export default LocationPerformance;
