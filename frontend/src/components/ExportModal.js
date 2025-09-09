import React, { useState } from 'react';
import { Download, FileText, Calendar, Filter, X } from 'lucide-react';

const ExportModal = ({ isOpen, onClose, onExport, dataType = 'data' }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [dateRange, setDateRange] = useState('30d');
  const [includeFilters, setIncludeFilters] = useState(true);
  const [customFields, setCustomFields] = useState([]);

  if (!isOpen) return null;

  const availableFields = {
    vehicles: [
      { id: 'name', label: 'Vehicle Name', default: true },
      { id: 'brand', label: 'Brand', default: true },
      { id: 'model', label: 'Model', default: true },
      { id: 'daily_rate', label: 'Daily Rate', default: true },
      { id: 'status', label: 'Status', default: true },
      { id: 'location', label: 'Location', default: true },
      { id: 'category', label: 'Category', default: false },
      { id: 'year', label: 'Year', default: false },
      { id: 'mileage', label: 'Mileage', default: false },
    ],
    customers: [
      { id: 'name', label: 'Customer Name', default: true },
      { id: 'email', label: 'Email', default: true },
      { id: 'phone', label: 'Phone', default: true },
      { id: 'registration_date', label: 'Registration Date', default: true },
      { id: 'total_bookings', label: 'Total Bookings', default: true },
      { id: 'total_spent', label: 'Total Spent', default: true },
      { id: 'status', label: 'Status', default: false },
      { id: 'last_booking', label: 'Last Booking', default: false },
    ],
    bookings: [
      { id: 'id', label: 'Booking ID', default: true },
      { id: 'customer', label: 'Customer', default: true },
      { id: 'vehicle', label: 'Vehicle', default: true },
      { id: 'start_date', label: 'Start Date', default: true },
      { id: 'end_date', label: 'End Date', default: true },
      { id: 'total_amount', label: 'Total Amount', default: true },
      { id: 'status', label: 'Status', default: true },
      { id: 'created_at', label: 'Created At', default: false },
      { id: 'payment_status', label: 'Payment Status', default: false },
    ],
    financial: [
      { id: 'date', label: 'Date', default: true },
      { id: 'revenue', label: 'Revenue', default: true },
      { id: 'bookings', label: 'Bookings', default: true },
      { id: 'avg_booking_value', label: 'Avg Booking Value', default: true },
      { id: 'costs', label: 'Costs', default: false },
      { id: 'profit', label: 'Profit', default: false },
      { id: 'margin', label: 'Margin', default: false },
    ]
  };

  const fields = availableFields[dataType] || availableFields.bookings;

  const handleFieldToggle = (fieldId) => {
    setCustomFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleExport = () => {
    const exportConfig = {
      format: exportFormat,
      dateRange,
      includeFilters,
      fields: customFields.length > 0 ? customFields : fields.filter(f => f.default).map(f => f.id)
    };
    
    onExport(exportConfig);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-dark-900/80 transition-opacity" onClick={onClose} />
        
        <div className="inline-block align-bottom bg-dark-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-dark-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg leading-6 font-medium text-white">
                Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)} Data
              </h3>
              <button
                onClick={onClose}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-2 text-primary-500"
                    />
                    <FileText className="h-4 w-4 mr-2 text-dark-300" />
                    <span className="text-white">CSV</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-2 text-primary-500"
                    />
                    <FileText className="h-4 w-4 mr-2 text-dark-300" />
                    <span className="text-white">Excel</span>
                  </label>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="input w-full"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                  <option value="all">All time</option>
                  <option value="custom">Custom range</option>
                </select>
              </div>

              {/* Include Filters */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeFilters}
                    onChange={(e) => setIncludeFilters(e.target.checked)}
                    className="mr-2 text-primary-500"
                  />
                  <Filter className="h-4 w-4 mr-2 text-dark-300" />
                  <span className="text-white">Include current filters</span>
                </label>
              </div>

              {/* Custom Fields */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Select Fields to Export
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                  {fields.map((field) => (
                    <label key={field.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={customFields.includes(field.id) || field.default}
                        onChange={() => handleFieldToggle(field.id)}
                        className="mr-2 text-primary-500"
                      />
                      <span className="text-white text-sm">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleExport}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm btn btn-primary"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-dark-600 shadow-sm px-4 py-2 bg-dark-800 text-base font-medium text-white hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
