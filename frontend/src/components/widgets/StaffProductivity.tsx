import React from 'react';

const StaffProductivity: React.FC = () => {
  const topPerformers = [
    { name: 'Dr. Johnson', revenue: '$2,840', utilization: '94%', rating: 4.9 },
    { name: 'Dr. Martinez', revenue: '$2,650', utilization: '89%', rating: 4.8 },
    { name: 'Sarah (Hygienist)', revenue: '$540', utilization: '92%', rating: 4.9 }
  ];

  return (
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Staff Productivity</h3>
          <p className="text-sm text-gray-600">Performance metrics and efficiency tracking</p>
        </div>
        <button className="text-primary-600 text-sm hover:text-primary-700">View All</button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-gray-900">47</div>
          <div className="text-xs text-gray-500">Total Staff</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-xl font-bold text-green-600">94.2%</div>
          <div className="text-xs text-gray-500">Avg Efficiency</div>
        </div>
      </div>

      <div className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div key={performer.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="text-lg">
                {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
              </div>
              <div>
                <div className="font-medium text-gray-900">{performer.name}</div>
                <div className="text-xs text-gray-500">Revenue/Day: {performer.revenue}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{performer.utilization}</div>
              <div className="text-xs text-gray-500">⭐ {performer.rating}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          📊 Productivity data from ADP timekeeping and Dentrix appointment completion rates
        </p>
      </div>
    </div>
  );
};

export default StaffProductivity;
