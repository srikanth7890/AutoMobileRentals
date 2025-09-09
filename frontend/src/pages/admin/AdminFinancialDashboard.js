import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Eye
} from 'lucide-react';
import { adminBookingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminFinancialDashboard = () => {
  const [dateRange, setDateRange] = useState('30d');
  const [reportType, setReportType] = useState('overview');

  // Fetch financial data
  const { data: financialOverview, isLoading: overviewLoading } = useQuery(
    ['financial-overview', dateRange],
    () => adminBookingAPI.getFinancialOverview({ period: dateRange })
  );

  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery(
    ['revenue-analytics', dateRange],
    () => adminBookingAPI.getRevenueAnalytics({ period: dateRange })
  );

  const { data: profitLoss, isLoading: profitLossLoading } = useQuery(
    ['profit-loss', dateRange],
    () => adminBookingAPI.getProfitLoss({ period: dateRange })
  );

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getPercentageColor = (value) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  if (overviewLoading || revenueLoading || profitLossLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
          <p className="text-dark-300">Track your business financial performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom range</option>
          </select>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-300">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(financialOverview?.total_revenue || 0)}
              </p>
              <p className={`text-sm ${getPercentageColor(financialOverview?.revenue_change || 0)}`}>
                {formatPercentage(financialOverview?.revenue_change || 0)} vs last period
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
              <p className="text-sm text-dark-300">Net Profit</p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(profitLoss?.net_profit || 0)}
              </p>
              <p className={`text-sm ${getPercentageColor(profitLoss?.profit_change || 0)}`}>
                {formatPercentage(profitLoss?.profit_change || 0)} vs last period
              </p>
            </div>
            <div className="p-3 bg-blue-900/50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-300">Average Booking Value</p>
              <p className="text-2xl font-bold text-white">
                {formatPrice(financialOverview?.avg_booking_value || 0)}
              </p>
              <p className={`text-sm ${getPercentageColor(financialOverview?.avg_booking_change || 0)}`}>
                {formatPercentage(financialOverview?.avg_booking_change || 0)} vs last period
              </p>
            </div>
            <div className="p-3 bg-yellow-900/50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-300">Profit Margin</p>
              <p className="text-2xl font-bold text-white">
                {(profitLoss?.profit_margin || 0).toFixed(1)}%
              </p>
              <p className={`text-sm ${getPercentageColor(profitLoss?.margin_change || 0)}`}>
                {formatPercentage(profitLoss?.margin_change || 0)} vs last period
              </p>
            </div>
            <div className="p-3 bg-purple-900/50 rounded-lg">
              <PieChart className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-secondary">
                <LineChart className="h-4 w-4 mr-1" />
                Chart
              </button>
              <button className="btn btn-sm btn-secondary">
                <Eye className="h-4 w-4 mr-1" />
                Details
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Daily Revenue</span>
              <span className="text-white font-semibold">
                {formatPrice(revenueAnalytics?.daily_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Weekly Revenue</span>
              <span className="text-white font-semibold">
                {formatPrice(revenueAnalytics?.weekly_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Monthly Revenue</span>
              <span className="text-white font-semibold">
                {formatPrice(revenueAnalytics?.monthly_revenue || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Peak Revenue Day</span>
              <span className="text-white font-semibold">
                {revenueAnalytics?.peak_day || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-dark-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
            <button className="btn btn-sm btn-secondary">
              <PieChart className="h-4 w-4 mr-1" />
              View Chart
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Vehicle Maintenance</span>
              <span className="text-white font-semibold">
                {formatPrice(profitLoss?.maintenance_costs || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Insurance</span>
              <span className="text-white font-semibold">
                {formatPrice(profitLoss?.insurance_costs || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Fuel Costs</span>
              <span className="text-white font-semibold">
                {formatPrice(profitLoss?.fuel_costs || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Other Expenses</span>
              <span className="text-white font-semibold">
                {formatPrice(profitLoss?.other_expenses || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profit & Loss Statement */}
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Profit & Loss Statement</h3>
          <div className="flex space-x-2">
            <button className="btn btn-sm btn-secondary">
              <FileText className="h-4 w-4 mr-1" />
              Full Report
            </button>
            <button className="btn btn-sm btn-primary">
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-3 px-4 text-dark-300 font-medium">Category</th>
                <th className="text-right py-3 px-4 text-dark-300 font-medium">Current Period</th>
                <th className="text-right py-3 px-4 text-dark-300 font-medium">Previous Period</th>
                <th className="text-right py-3 px-4 text-dark-300 font-medium">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              <tr>
                <td className="py-3 px-4 text-white font-medium">Revenue</td>
                <td className="py-3 px-4 text-right text-white">
                  {formatPrice(profitLoss?.revenue || 0)}
                </td>
                <td className="py-3 px-4 text-right text-dark-300">
                  {formatPrice(profitLoss?.previous_revenue || 0)}
                </td>
                <td className={`py-3 px-4 text-right ${getPercentageColor(profitLoss?.revenue_change || 0)}`}>
                  {formatPercentage(profitLoss?.revenue_change || 0)}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-white">Total Costs</td>
                <td className="py-3 px-4 text-right text-white">
                  {formatPrice(profitLoss?.total_costs || 0)}
                </td>
                <td className="py-3 px-4 text-right text-dark-300">
                  {formatPrice(profitLoss?.previous_costs || 0)}
                </td>
                <td className={`py-3 px-4 text-right ${getPercentageColor(profitLoss?.costs_change || 0)}`}>
                  {formatPercentage(profitLoss?.costs_change || 0)}
                </td>
              </tr>
              <tr className="border-t border-dark-600">
                <td className="py-3 px-4 text-white font-semibold">Net Profit</td>
                <td className="py-3 px-4 text-right text-white font-semibold">
                  {formatPrice(profitLoss?.net_profit || 0)}
                </td>
                <td className="py-3 px-4 text-right text-dark-300">
                  {formatPrice(profitLoss?.previous_profit || 0)}
                </td>
                <td className={`py-3 px-4 text-right font-semibold ${getPercentageColor(profitLoss?.profit_change || 0)}`}>
                  {formatPercentage(profitLoss?.profit_change || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-dark-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-secondary">
            <FileText className="h-4 w-4 mr-2" />
            Generate P&L Report
          </button>
          <button className="btn btn-secondary">
            <BarChart3 className="h-4 w-4 mr-2" />
            Revenue Forecast
          </button>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export All Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminFinancialDashboard;
