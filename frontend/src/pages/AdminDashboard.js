import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Car, 
  Users, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  MapPin,
  Fuel,
  Settings
} from 'lucide-react';
import { bookingAPI, vehicleAPI, adminBookingAPI, adminVehicleAPI, adminCustomerAPI } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  const queryClient = useQueryClient();

  // Update vehicle mutation
  const updateVehicleMutation = useMutation(
    ({ id, data }) => adminVehicleAPI.updateVehicle(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-vehicles');
        setShowEditModal(false);
        setEditingVehicle(null);
      },
    }
  );

  // Handle form submission
  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    try {
      if (isEdit && editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          data: formData
        });
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
    }
  };

  // Fetch comprehensive admin data
  const { data: stats } = useQuery('admin-stats', bookingAPI.getStatistics);
  const { data: recentBookingsData } = useQuery(
    'admin-recent-bookings',
    () => bookingAPI.getAllBookings({ limit: 10 })
  );
  const { data: vehiclesData } = useQuery('admin-vehicles', vehicleAPI.getVehicles);
  
  // Ensure data is properly structured
  const recentBookings = recentBookingsData || { results: [] };
  const vehicles = vehiclesData || { results: [], count: 0 };
  
  // Enhanced analytics data
  const { data: financialOverview } = useQuery(
    ['financial-overview', dateRange],
    () => adminBookingAPI.getFinancialOverview({ period: dateRange })
  );
  
  const { data: businessIntelligence } = useQuery(
    ['business-intelligence', dateRange],
    () => adminBookingAPI.getBusinessIntelligence({ period: dateRange })
  );
  
  const { data: operationalMetrics } = useQuery(
    ['operational-metrics', dateRange],
    () => adminBookingAPI.getOperationalMetrics({ period: dateRange })
  );
  
  const { data: vehicleAnalytics } = useQuery(
    ['vehicle-analytics', dateRange],
    () => adminVehicleAPI.getAnalytics({ period: dateRange })
  );
  
  const { data: customerAnalytics } = useQuery(
    ['customer-analytics', dateRange],
    () => adminCustomerAPI.getAnalytics({ period: dateRange })
  );

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-dark-300">
                Comprehensive overview of your vehicle rental business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="btn btn-secondary">
                <Activity className="h-4 w-4 mr-2" />
                Real-time
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-dark-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: PieChart },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'vehicles', label: 'Vehicles', icon: Car },
              { id: 'customers', label: 'Customers', icon: Users },
              { id: 'operations', label: 'Operations', icon: Target },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-dark-300 hover:text-white hover:border-dark-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPrice(financialOverview?.total_revenue || stats?.total_revenue || 0)}
                    </p>
                    <p className={`text-sm ${(financialOverview?.revenue_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {financialOverview?.revenue_change ? `${financialOverview.revenue_change >= 0 ? '+' : ''}${financialOverview.revenue_change.toFixed(1)}%` : ''} vs last period
                    </p>
                  </div>
                  <div className="p-3 bg-green-900/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Total Bookings</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_bookings || 0}</p>
                    <p className="text-sm text-dark-300">
                      {stats?.active_bookings || 0} active
                    </p>
                  </div>
                  <div className="p-3 bg-primary-900/50 rounded-lg">
                    <Calendar className="h-6 w-6 text-primary-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Fleet Size</p>
                    <p className="text-2xl font-bold text-white">{vehicles?.count || 0}</p>
                    <p className="text-sm text-dark-300">
                      {vehicleAnalytics?.available_vehicles || 0} available
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <Car className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Customer Satisfaction</p>
                    <p className="text-2xl font-bold text-white">
                      {(businessIntelligence?.customer_satisfaction || 4.2).toFixed(1)}/5
                    </p>
                    <p className="text-sm text-dark-300">
                      {customerAnalytics?.total_customers || 0} customers
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-900/50 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue Performance</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Daily Average</span>
                    <span className="text-white font-semibold">
                      {formatPrice(financialOverview?.avg_daily_revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Peak Day</span>
                    <span className="text-white font-semibold">
                      {formatPrice(financialOverview?.peak_daily_revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Growth Rate</span>
                    <span className={`font-semibold ${(financialOverview?.revenue_change || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {financialOverview?.revenue_change ? `${financialOverview.revenue_change >= 0 ? '+' : ''}${financialOverview.revenue_change.toFixed(1)}%` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Operational Efficiency</h3>
                  <Target className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Vehicle Utilization</span>
                    <span className="text-white font-semibold">
                      {(businessIntelligence?.vehicle_utilization || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Completion Rate</span>
                    <span className="text-white font-semibold">
                      {(operationalMetrics?.completion_rate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Response Time</span>
                    <span className="text-white font-semibold">
                      {operationalMetrics?.avg_response_time || 0}m
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Business Health</h3>
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Profit Margin</span>
                    <span className="text-white font-semibold">
                      {(businessIntelligence?.profit_margin || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Customer Retention</span>
                    <span className="text-white font-semibold">
                      {(businessIntelligence?.retention_rate || 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Market Share</span>
                    <span className="text-white font-semibold">
                      {(businessIntelligence?.market_share || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Bookings</h2>
                <Link
                  to="#"
                  onClick={() => setActiveTab('bookings')}
                  className="text-primary-400 hover:text-primary-300 text-sm"
                >
                  View All
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Dates</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings?.results?.map((booking) => (
                      <tr key={booking.id} className="border-b border-dark-700">
                        <td className="py-3 px-4 text-white">
                          {booking.user?.first_name || 'N/A'} {booking.user?.last_name || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-white">{booking.vehicle?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-dark-300">
                          {booking.start_date ? new Date(booking.start_date).toLocaleDateString() : 'N/A'} - {booking.end_date ? new Date(booking.end_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {booking.total_amount ? formatPrice(booking.total_amount) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-primary-400 hover:text-primary-300 mr-2">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">All Bookings</h2>
                <div className="flex space-x-2">
                  <select className="input">
                    <option>All Statuses</option>
                    <option>Pending</option>
                    <option>Confirmed</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Dates</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Amount</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings?.results?.map((booking) => (
                      <tr key={booking.id} className="border-b border-dark-700">
                        <td className="py-3 px-4 text-white">#{booking.id}</td>
                        <td className="py-3 px-4 text-white">
                          {booking.user.first_name} {booking.user.last_name}
                        </td>
                        <td className="py-3 px-4 text-white">{booking.vehicle.name}</td>
                        <td className="py-3 px-4 text-dark-300">
                          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {formatPrice(booking.total_amount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button className="text-primary-400 hover:text-primary-300 mr-2">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-400 hover:text-yellow-300">
                            <Edit className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
                  <button className="btn btn-sm btn-secondary">
                    <LineChart className="h-4 w-4 mr-1" />
                    View Chart
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Today's Revenue</span>
                    <span className="text-white font-semibold">
                      {formatPrice(financialOverview?.daily_revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">This Week</span>
                    <span className="text-white font-semibold">
                      {formatPrice(financialOverview?.weekly_revenue || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">This Month</span>
                    <span className="text-white font-semibold">
                      {formatPrice(financialOverview?.monthly_revenue || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">Customer Insights</h3>
                  <button className="btn btn-sm btn-secondary">
                    <PieChart className="h-4 w-4 mr-1" />
                    View Chart
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">New Customers</span>
                    <span className="text-white font-semibold">
                      {customerAnalytics?.new_customers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Returning Customers</span>
                    <span className="text-white font-semibold">
                      {customerAnalytics?.returning_customers || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Average Rating</span>
                    <span className="text-white font-semibold">
                      {(customerAnalytics?.avg_rating || 4.2).toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Vehicle Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {(vehicleAnalytics?.utilization_rate || 0).toFixed(1)}%
                  </div>
                  <div className="text-dark-300">Fleet Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {vehicleAnalytics?.avg_daily_rate || 0}
                  </div>
                  <div className="text-dark-300">Average Daily Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {vehicleAnalytics?.maintenance_count || 0}
                  </div>
                  <div className="text-dark-300">Maintenance Events</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Total Customers</p>
                    <p className="text-2xl font-bold text-white">
                      {customerAnalytics?.total_customers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <Users className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">New This Month</p>
                    <p className="text-2xl font-bold text-white">
                      {customerAnalytics?.new_customers || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-green-900/50 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Retention Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {(customerAnalytics?.retention_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-900/50 rounded-lg">
                    <Target className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Avg. Value</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPrice(customerAnalytics?.avg_customer_value || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Customer Segments</h3>
                <button className="btn btn-sm btn-secondary">
                  <PieChart className="h-4 w-4 mr-1" />
                  View Chart
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {customerAnalytics?.premium_customers || 0}
                  </div>
                  <div className="text-dark-300">Premium Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {customerAnalytics?.regular_customers || 0}
                  </div>
                  <div className="text-dark-300">Regular Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {customerAnalytics?.new_customers || 0}
                  </div>
                  <div className="text-dark-300">New Customers</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Operations Tab */}
        {activeTab === 'operations' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Completion Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {(operationalMetrics?.completion_rate || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-green-900/50 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Response Time</p>
                    <p className="text-2xl font-bold text-white">
                      {operationalMetrics?.avg_response_time || 0}m
                    </p>
                  </div>
                  <div className="p-3 bg-blue-900/50 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Vehicle Downtime</p>
                    <p className="text-2xl font-bold text-white">
                      {(operationalMetrics?.vehicle_downtime || 0).toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-900/50 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </div>

              <div className="bg-dark-800 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-dark-300">Cost per Booking</p>
                    <p className="text-2xl font-bold text-white">
                      {formatPrice(operationalMetrics?.cost_per_booking || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-900/50 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Operational Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Efficiency Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Booking Processing Time</span>
                      <span className="text-white font-semibold">
                        {operationalMetrics?.booking_processing_time || 0} minutes
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Vehicle Turnaround</span>
                      <span className="text-white font-semibold">
                        {operationalMetrics?.turnaround_time || 0} hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Maintenance Efficiency</span>
                      <span className="text-white font-semibold">
                        {(operationalMetrics?.maintenance_efficiency || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-md font-medium text-white mb-3">Quality Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Customer Complaints</span>
                      <span className="text-white font-semibold">
                        {operationalMetrics?.complaints || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Vehicle Condition</span>
                      <span className="text-white font-semibold">
                        {(operationalMetrics?.vehicle_condition_score || 0).toFixed(1)}/5
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-300">Service Quality</span>
                      <span className="text-white font-semibold">
                        {(operationalMetrics?.service_quality_rating || 0).toFixed(1)}/5
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Vehicles Tab */}
        {activeTab === 'vehicles' && (
          <div>
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Vehicle Management</h2>
                <button className="btn btn-primary">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Vehicle
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-dark-700">
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Vehicle</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Brand</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Daily Rate</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Location</th>
                      <th className="text-left py-3 px-4 text-dark-300 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles?.results?.map((vehicle) => (
                      <tr key={vehicle.id} className="border-b border-dark-700">
                        <td className="py-3 px-4 text-white">{vehicle.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-white">{vehicle.brand?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-white font-semibold">
                          {vehicle.daily_rate ? formatPrice(vehicle.daily_rate) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            vehicle.status === 'available' 
                              ? 'text-green-400 bg-green-900/50' 
                              : 'text-red-400 bg-red-900/50'
                          }`}>
                            {vehicle.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-dark-300">{vehicle.location}</td>
                        <td className="py-3 px-4">
                          <button 
                            onClick={() => {
                              setSelectedVehicle(vehicle);
                              setShowVehicleModal(true);
                            }}
                            className="text-primary-400 hover:text-primary-300 mr-2"
                            title="View Vehicle"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setShowEditModal(true);
                            }}
                            className="text-yellow-400 hover:text-yellow-300 mr-2"
                            title="Edit Vehicle"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this vehicle?')) {
                                // Navigate to the vehicle management page for delete functionality
                                window.location.href = '/admin/vehicles';
                              }
                            }}
                            className="text-red-400 hover:text-red-300"
                            title="Delete Vehicle"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vehicle View Modal */}
      {showVehicleModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Vehicle Details</h2>
              <button
                onClick={() => {
                  setShowVehicleModal(false);
                  setSelectedVehicle(null);
                }}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Vehicle Image */}
              {selectedVehicle.image && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <img
                    src={selectedVehicle.image}
                    alt={selectedVehicle.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Vehicle Name</label>
                    <p className="text-white font-medium">{selectedVehicle.name}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Model</label>
                    <p className="text-white font-medium">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Brand</label>
                    <p className="text-white font-medium">{selectedVehicle.brand?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Category</label>
                    <p className="text-white font-medium">{selectedVehicle.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Year</label>
                    <p className="text-white font-medium">{selectedVehicle.year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Color</label>
                    <p className="text-white font-medium">{selectedVehicle.color || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <Fuel className="h-4 w-4 mr-1" />
                      Fuel Type
                    </label>
                    <p className="text-white font-medium">{selectedVehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Transmission</label>
                    <p className="text-white font-medium">{selectedVehicle.transmission || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Engine</label>
                    <p className="text-white font-medium">{selectedVehicle.engine || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Seating Capacity</label>
                    <p className="text-white font-medium">{selectedVehicle.seating_capacity || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Rental Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Rental Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Daily Rate</label>
                    <p className="text-white font-medium text-lg">
                      ${selectedVehicle.daily_rate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedVehicle.status === 'available' 
                          ? 'text-green-400 bg-green-900/50' 
                          : 'text-red-400 bg-red-900/50'
                      }`}>
                        {selectedVehicle.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </label>
                    <p className="text-white font-medium">{selectedVehicle.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedVehicle.description && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                  <p className="text-dark-300">{selectedVehicle.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowVehicleModal(false);
                  setSelectedVehicle(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowVehicleModal(false);
                  setSelectedVehicle(null);
                  window.location.href = '/admin/vehicles';
                }}
                className="btn btn-primary"
              >
                Manage Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Edit Modal */}
      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Vehicle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVehicle(null);
                }}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => handleSubmit(e, true)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingVehicle.name}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    name="model"
                    defaultValue={editingVehicle.model}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Year
                  </label>
                  <input
                    type="number"
                    name="year"
                    defaultValue={editingVehicle.year}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    name="color"
                    defaultValue={editingVehicle.color}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Daily Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    defaultValue={editingVehicle.daily_rate}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingVehicle.status}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingVehicle.location}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    name="seating_capacity"
                    defaultValue={editingVehicle.seating_capacity}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingVehicle.description}
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVehicle(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
