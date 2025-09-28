import React from 'react';
import { Link } from 'react-router-dom';

const ReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
          <span className="text-xs text-gray-500">Automated BI reports</span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Generate executive, operational, and clinical reports. Schedule recurring deliveries and export in multiple formats.
        </p>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">New Report</button>
          <Link to="/integrations" className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50">Data Sources</Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-3">Recent Reports</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>Executive Summary – Last 30 days <span className="text-xs text-gray-500">(PDF)</span></li>
          <li>Location Performance – QTD <span className="text-xs text-gray-500">(CSV)</span></li>
          <li>Clinical Outcomes – Last month <span className="text-xs text-gray-500">(PDF)</span></li>
        </ul>
      </div>
    </div>
  );
};

export default ReportsPage;

