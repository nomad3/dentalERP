import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Dental Practice ERP</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, User!</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className="flex">
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r">
          <div className="p-4">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/patients" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Patients
                </a>
              </li>
              <li>
                <a href="/appointments" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Appointments
                </a>
              </li>
              <li>
                <a href="/practices" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Practices
                </a>
              </li>
              <li>
                <a href="/integrations" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  Integrations
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
