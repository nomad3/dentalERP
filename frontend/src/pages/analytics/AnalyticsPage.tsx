import React from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';
import RevenueAnalyticsPage from './RevenueAnalyticsPage';
import PatientAnalyticsPage from './PatientAnalyticsPage';
import StaffAnalyticsPage from './StaffAnalyticsPage';
import ClinicalAnalyticsPage from './ClinicalAnalyticsPage';
import FinancialAnalyticsPage from './FinancialAnalyticsPage';
import SchedulingAnalyticsPage from './SchedulingAnalyticsPage';
import RetentionCohortsPage from './RetentionCohortsPage';
import BenchmarkingPage from './BenchmarkingPage';
import ForecastingPage from './ForecastingPage';
import ReportsPage from './ReportsPage';

const tabs = [
  { to: 'revenue', label: 'Revenue' },
  { to: 'patients', label: 'Patients' },
  { to: 'staff', label: 'Staff' },
  { to: 'clinical', label: 'Clinical' },
  { to: 'financial', label: 'Financial' },
  { to: 'scheduling', label: 'Scheduling' },
  { to: 'retention', label: 'Retention' },
  { to: 'benchmarking', label: 'Benchmarking' },
  { to: 'forecasting', label: 'Forecasting' },
  { to: 'reports', label: 'Reports' },
];

const AnalyticsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Deep-dive BI views across key domains</p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2" aria-label="Analytics sections">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) => `
                px-4 py-2 text-sm font-medium rounded-t-md border-b-2
                ${isActive ? 'border-primary-600 text-primary-700 bg-primary-50' : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
              `}
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Nested analytics routes */}
      <div>
        <Routes>
          <Route index element={<Navigate to="revenue" replace />} />
          <Route path="revenue" element={<RevenueAnalyticsPage />} />
          <Route path="patients" element={<PatientAnalyticsPage />} />
          <Route path="staff" element={<StaffAnalyticsPage />} />
          <Route path="clinical" element={<ClinicalAnalyticsPage />} />
          <Route path="financial" element={<FinancialAnalyticsPage />} />
          <Route path="scheduling" element={<SchedulingAnalyticsPage />} />
          <Route path="retention" element={<RetentionCohortsPage />} />
          <Route path="benchmarking" element={<BenchmarkingPage />} />
          <Route path="forecasting" element={<ForecastingPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="revenue" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AnalyticsPage;
