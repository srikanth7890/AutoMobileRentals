import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  BarChart3, 
  PieChart, 
  LineChart,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  FileText,
  Eye,
  Settings,
  Target,
  Users,
  Car,
  DollarSign,
  Clock
} from 'lucide-react';
import { adminBookingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminReportingDashboard = () => {
  const [reportType, setReportType] = useState('business-intelligence');
  const [dateRange, setDateRange] = useState('30d');
  const [customReport, setCustomReport] = useState('');

  // Fetch business intelligence data
  const { data: businessIntelligence, isLoading: biLoading } = useQuery(
    ['business-intelligence', dateRange],
    () => adminBookingAPI.getBusinessIntelligence({ period: dateRange })
  );

  // Fetch operational metrics
  const { data: operationalMetrics, isLoading: omLoading } = useQuery(
    ['operational-metrics', dateRange],
    () => adminBookingAPI.getOperationalMetrics({ period: dateRange })
  );

  // Fetch predictive analytics
  const { data: predictiveAnalytics, isLoading: paLoading } = useQuery(
    ['predictive-analytics', dateRange],
    () => adminBookingAPI.getPredictiveAnalytics({ period: dateRange })
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

  if (biLoading || omLoading || paLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reporting Dashboard</h1>
          <p className="text-dark-300">Comprehensive business insights and analytics</p>
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
          </select>
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b border-dark-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'business-intelligence', label: 'Business Intelligence', icon: BarChart3 },
            { id: 'operational-metrics', label: 'Operational Metrics', icon: Target },
            { id: 'predictive-analytics', label: 'Predictive Analytics', icon: TrendingUp },
            { id: 'custom-reports', label: 'Custom Reports', icon: FileText },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                reportType === tab.id
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

      {/* Business Intelligence Tab */}
      {reportType === 'business-intelligence' && (
        <div className="space-y-6">
          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Revenue Growth</p>
                  <p className="text-2xl font-bold text-white">
                    {formatPercentage(businessIntelligence?.revenue_growth || 0)}
                  </p>
                  <p className="text-sm text-dark-300">vs last period</p>
                </div>
                <div className="p-3 bg-green-900/50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Customer Satisfaction</p>
                  <p className="text-2xl font-bold text-white">
                    {(businessIntelligence?.customer_satisfaction || 0).toFixed(1)}/5
                  </p>
                  <p className="text-sm text-dark-300">average rating</p>
                </div>
                <div className="p-3 bg-blue-900/50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Vehicle Utilization</p>
                  <p className="text-2xl font-bold text-white">
                    {(businessIntelligence?.vehicle_utilization || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-dark-300">fleet efficiency</p>
                </div>
                <div className="p-3 bg-yellow-900/50 rounded-lg">
                  <Car className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Market Share</p>
                  <p className="text-2xl font-bold text-white">
                    {(businessIntelligence?.market_share || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-dark-300">local market</p>
                </div>
                <div className="p-3 bg-purple-900/50 rounded-lg">
                  <Target className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Revenue Analysis</h3>
                <button className="btn btn-sm btn-secondary">
                  <LineChart className="h-4 w-4 mr-1" />
                  View Chart
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Total Revenue</span>
                  <span className="text-white font-semibold">
                    {formatPrice(businessIntelligence?.total_revenue || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Average Daily Revenue</span>
                  <span className="text-white font-semibold">
                    {formatPrice(businessIntelligence?.avg_daily_revenue || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Peak Revenue Day</span>
                  <span className="text-white font-semibold">
                    {businessIntelligence?.peak_revenue_day || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Revenue per Vehicle</span>
                  <span className="text-white font-semibold">
                    {formatPrice(businessIntelligence?.revenue_per_vehicle || 0)}
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
                    {businessIntelligence?.new_customers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Returning Customers</span>
                  <span className="text-white font-semibold">
                    {businessIntelligence?.returning_customers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Customer Retention Rate</span>
                  <span className="text-white font-semibold">
                    {(businessIntelligence?.retention_rate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Average Customer Value</span>
                  <span className="text-white font-semibold">
                    {formatPrice(businessIntelligence?.avg_customer_value || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Operational Metrics Tab */}
      {reportType === 'operational-metrics' && (
        <div className="space-y-6">
          {/* Operational KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Booking Completion Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {(operationalMetrics?.completion_rate || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-dark-300">successful bookings</p>
                </div>
                <div className="p-3 bg-green-900/50 rounded-lg">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-300">Average Response Time</p>
                  <p className="text-2xl font-bold text-white">
                    {operationalMetrics?.avg_response_time || 0}m
                  </p>
                  <p className="text-sm text-dark-300">customer inquiries</p>
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
                  <p className="text-sm text-dark-300">maintenance/repair</p>
                </div>
                <div className="p-3 bg-yellow-900/50 rounded-lg">
                  <Car className="h-6 w-6 text-yellow-500" />
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
                  <p className="text-sm text-dark-300">operational cost</p>
                </div>
                <div className="p-3 bg-purple-900/50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Operational Details */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Operational Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Efficiency Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Booking Processing Time</span>
                    <span className="text-white font-semibold">
                      {operationalMetrics?.booking_processing_time || 0} minutes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Vehicle Turnaround Time</span>
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
              
              <div className="space-y-4">
                <h4 className="text-md font-medium text-white">Quality Metrics</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Customer Complaints</span>
                    <span className="text-white font-semibold">
                      {operationalMetrics?.complaints || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Vehicle Condition Score</span>
                    <span className="text-white font-semibold">
                      {(operationalMetrics?.vehicle_condition_score || 0).toFixed(1)}/5
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-300">Service Quality Rating</span>
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

      {/* Predictive Analytics Tab */}
      {reportType === 'predictive-analytics' && (
        <div className="space-y-6">
          {/* Predictive Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Revenue Forecast</h3>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Next 30 days</span>
                  <span className="text-white font-semibold">
                    {formatPrice(predictiveAnalytics?.revenue_forecast_30d || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Next 90 days</span>
                  <span className="text-white font-semibold">
                    {formatPrice(predictiveAnalytics?.revenue_forecast_90d || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Confidence Level</span>
                  <span className="text-green-400 font-semibold">
                    {(predictiveAnalytics?.forecast_confidence || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Demand Prediction</h3>
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Peak Demand Days</span>
                  <span className="text-white font-semibold">
                    {predictiveAnalytics?.peak_demand_days || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Low Demand Days</span>
                  <span className="text-white font-semibold">
                    {predictiveAnalytics?.low_demand_days || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Optimal Pricing</span>
                  <span className="text-white font-semibold">
                    {formatPrice(predictiveAnalytics?.optimal_pricing || 0)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Risk Assessment</h3>
                <Target className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Cancellation Risk</span>
                  <span className="text-white font-semibold">
                    {(predictiveAnalytics?.cancellation_risk || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Maintenance Risk</span>
                  <span className="text-white font-semibold">
                    {(predictiveAnalytics?.maintenance_risk || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-300">Customer Churn Risk</span>
                  <span className="text-white font-semibold">
                    {(predictiveAnalytics?.churn_risk || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">AI Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-medium text-white mb-3">Revenue Optimization</h4>
                <ul className="space-y-2 text-dark-300">
                  {predictiveAnalytics?.revenue_recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-400 mr-2">•</span>
                      {rec}
                    </li>
                  )) || [
                    'Increase pricing during peak demand periods',
                    'Offer discounts for low-demand days',
                    'Focus on high-value customer segments'
                  ].map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-md font-medium text-white mb-3">Operational Improvements</h4>
                <ul className="space-y-2 text-dark-300">
                  {predictiveAnalytics?.operational_recommendations?.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-400 mr-2">•</span>
                      {rec}
                    </li>
                  )) || [
                    'Schedule maintenance during low-demand periods',
                    'Optimize vehicle allocation across locations',
                    'Implement dynamic pricing strategy'
                  ].map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-primary-400 mr-2">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reports Tab */}
      {reportType === 'custom-reports' && (
        <div className="space-y-6">
          <div className="bg-dark-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Custom Report Builder</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Report Type
                </label>
                <select className="input">
                  <option>Financial Summary</option>
                  <option>Customer Analysis</option>
                  <option>Vehicle Performance</option>
                  <option>Operational Metrics</option>
                  <option>Custom Query</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date Range
                </label>
                <select className="input">
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                  <option>Custom range</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-white mb-2">
                  Custom Parameters
                </label>
                <textarea
                  className="input h-24"
                  placeholder="Enter custom report parameters or SQL query..."
                  value={customReport}
                  onChange={(e) => setCustomReport(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button className="btn btn-secondary">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button className="btn btn-primary">
                <Download className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportingDashboard;
