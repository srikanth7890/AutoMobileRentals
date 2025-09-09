import React from 'react';
import { BarChart3, PieChart, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

const SimpleChart = ({ 
  type = 'bar', 
  data = [], 
  title, 
  height = 200,
  showTrend = false,
  trendValue = 0
}) => {
  const getMaxValue = () => {
    return Math.max(...data.map(item => item.value), 0);
  };

  const getTotalValue = () => {
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  const renderBarChart = () => {
    const maxValue = getMaxValue();
    
    return (
      <div className="flex items-end justify-between h-full px-4 pb-4">
        {data.map((item, index) => {
          const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full max-w-8 bg-primary-500 rounded-t" style={{ height: `${height}%` }} />
              <div className="text-xs text-dark-300 mt-2 text-center">
                {item.label}
              </div>
              <div className="text-xs text-white font-semibold">
                {item.value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    const total = getTotalValue();
    let cumulativePercentage = 0;
    
    const colors = [
      'bg-primary-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-blue-500',
      'bg-pink-500',
      'bg-indigo-500'
    ];

    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = total > 0 ? (item.value / total) * 100 : 0;
              const strokeDasharray = `${percentage} ${100 - percentage}`;
              const strokeDashoffset = -cumulativePercentage;
              cumulativePercentage += percentage;
              
              return (
                <circle
                  key={index}
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={`text-${colors[index % colors.length].split('-')[1]}-500`}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white">{total}</div>
              <div className="text-xs text-dark-300">Total</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLineChart = () => {
    const maxValue = getMaxValue();
    const minValue = Math.min(...data.map(item => item.value), 0);
    const range = maxValue - minValue;
    
    if (data.length < 2) {
      return (
        <div className="flex items-center justify-center h-full text-dark-300">
          Need at least 2 data points for line chart
        </div>
      );
    }

    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-full p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            points={points}
            className="text-primary-500"
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = range > 0 ? 100 - ((item.value - minValue) / range) * 100 : 50;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="currentColor"
                className="text-primary-500"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'pie':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      case 'bar':
      default:
        return renderBarChart();
    }
  };

  const getTrendIcon = () => {
    if (trendValue > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trendValue < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const getTrendColor = () => {
    if (trendValue > 0) return 'text-green-400';
    if (trendValue < 0) return 'text-red-400';
    return 'text-dark-300';
  };

  return (
    <div className="bg-dark-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {showTrend && (
          <div className={`flex items-center ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="ml-1 text-sm">
              {trendValue > 0 ? '+' : ''}{trendValue.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      
      <div style={{ height: `${height}px` }}>
        {data.length > 0 ? renderChart() : (
          <div className="flex items-center justify-center h-full text-dark-300">
            No data available
          </div>
        )}
      </div>
      
      {type === 'pie' && data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {data.map((item, index) => {
            const percentage = getTotalValue() > 0 ? (item.value / getTotalValue()) * 100 : 0;
            const colors = [
              'bg-primary-500',
              'bg-green-500', 
              'bg-yellow-500',
              'bg-red-500',
              'bg-purple-500',
              'bg-blue-500',
              'bg-pink-500',
              'bg-indigo-500'
            ];
            
            return (
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]} mr-2`} />
                <span className="text-sm text-dark-300">{item.label}</span>
                <span className="text-sm text-white font-semibold ml-auto">
                  {percentage.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimpleChart;
