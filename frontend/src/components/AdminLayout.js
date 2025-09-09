import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Car, 
  Users, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  Menu,
  X,
  Home,
  TrendingUp,
  PieChart,
  Download,
  Filter
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'Bookings', href: '/admin/bookings', icon: Calendar },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Financial', href: '/admin/financial', icon: DollarSign },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-dark-900">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-dark-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 bg-dark-800">
          <div className="flex items-center justify-between px-6 py-6 border-b border-dark-700">
            <h2 className="text-lg font-semibold text-white">Admin Panel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-dark-300 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 ${
                  isActive(item.href)
                    ? 'bg-primary-900/50 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop layout using CSS Grid */}
      <div className="hidden lg:grid lg:grid-cols-[256px_1fr] lg:min-h-screen">
        {/* Desktop sidebar */}
        <div className="bg-dark-800 border-r border-dark-700 flex flex-col">
          <div className="flex items-center px-6 py-6 border-b border-dark-700">
            <Link to="/" className="flex items-center text-white hover:text-primary-400">
              <Home className="h-6 w-6 mr-2" />
              <span className="text-lg font-semibold">Admin Panel</span>
            </Link>
          </div>
          <nav className="flex-1 px-2 py-4 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 mb-1 ${
                  isActive(item.href)
                    ? 'bg-primary-900/50 text-primary-400'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        {/* Main content area */}
        <div className="flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="bg-dark-800 border-b border-dark-700 flex-shrink-0">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-dark-300">
                  Welcome back, Admin
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile layout */}
      <div className="lg:hidden">
        {/* Mobile top bar */}
        <div className="bg-dark-800 border-b border-dark-700">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-dark-300 hover:text-white"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="text-sm text-dark-300">
              Welcome back, Admin
            </div>
          </div>
        </div>

        {/* Mobile page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
