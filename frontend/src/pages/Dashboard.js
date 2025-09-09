import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  DollarSign,
  User
} from 'lucide-react';
import { authAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { data: dashboardData, isLoading } = useQuery(
    'user-dashboard',
    authAPI.getDashboard
  );

  const { data: recentBookings } = useQuery(
    'recent-bookings',
    () => bookingAPI.getMyBookings({ limit: 5 })
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const user = dashboardData?.user || {};

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-900/50';
      case 'active':
        return 'text-blue-400 bg-blue-900/50';
      case 'completed':
        return 'text-gray-400 bg-gray-900/50';
      case 'cancelled':
        return 'text-red-400 bg-red-900/50';
      case 'pending':
        return 'text-yellow-400 bg-yellow-900/50';
      default:
        return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user.first_name || user.email}!
          </h1>
          <p className="text-dark-300">
            Here's an overview of your vehicle rental activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-primary-900/50 rounded-lg">
                <Car className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.total_bookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">Active Bookings</p>
                <p className="text-2xl font-bold text-white">{stats.active_bookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-900/50 rounded-lg">
                <Clock className="h-6 w-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completed_bookings || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-900/50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-dark-300">Member Since</p>
                <p className="text-2xl font-bold text-white">
                  {user.created_at ? new Date(user.created_at).getFullYear() : '2024'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
                <Link
                  to="/my-bookings"
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  View All
                </Link>
              </div>

              {recentBookings?.results?.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 text-dark-500 mx-auto mb-4" />
                  <p className="text-dark-300 mb-4">No bookings yet</p>
                  <Link to="/vehicles" className="btn btn-primary">
                    Browse Vehicles
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings?.results?.map((booking) => (
                    <div key={booking.id} className="border border-dark-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{booking.vehicle.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {getStatusIcon(booking.status)}
                          <span className="ml-1 capitalize">{booking.status}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-dark-300">
                        <div>
                          <span className="block">Start Date:</span>
                          <span className="text-white">{new Date(booking.start_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block">End Date:</span>
                          <span className="text-white">{new Date(booking.end_date).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="block">Duration:</span>
                          <span className="text-white">{booking.total_days} days</span>
                        </div>
                        <div>
                          <span className="block">Total:</span>
                          <span className="text-white font-semibold">${booking.total_amount}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/vehicles"
                  className="btn btn-primary w-full justify-start"
                >
                  <Car className="h-4 w-4 mr-2" />
                  Browse Vehicles
                </Link>
                <Link
                  to="/my-bookings"
                  className="btn btn-outline w-full justify-start"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  My Bookings
                </Link>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Profile</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary-500 mr-3" />
                  <div>
                    <p className="text-sm text-dark-300">Name</p>
                    <p className="text-white">{user.first_name} {user.last_name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-primary-500 mr-3" />
                  <div>
                    <p className="text-sm text-dark-300">Member Since</p>
                    <p className="text-white">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {user.driving_license && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                    <div>
                      <p className="text-sm text-dark-300">License</p>
                      <p className="text-white">Verified</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
