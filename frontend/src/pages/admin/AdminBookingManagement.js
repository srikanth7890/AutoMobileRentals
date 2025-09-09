import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Download,
  Upload,
  MoreHorizontal,
  Calendar,
  User,
  Car,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  MapPin,
  CreditCard
} from 'lucide-react';
import { adminBookingAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminBookingManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingBooking, setViewingBooking] = useState(null);
  const [editingBooking, setEditingBooking] = useState(null);

  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookingsData, isLoading } = useQuery(
    ['admin-bookings', { search: searchTerm, status: statusFilter, date: dateFilter }],
    () => adminBookingAPI.getAllBookings({ 
      search: searchTerm, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      date: dateFilter !== 'all' ? dateFilter : undefined
    })
  );
  
  // Ensure bookings data is properly structured
  const bookings = bookingsData || { results: [], count: 0 };

  // Update booking mutation
  const updateBookingMutation = useMutation(
    ({ id, data }) => adminBookingAPI.updateBooking(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-bookings');
      },
    }
  );

  // Bulk operations mutation
  const bulkOperationsMutation = useMutation(
    (data) => adminBookingAPI.bulkOperations(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-bookings');
        setSelectedBookings([]);
        setShowBulkActions(false);
      },
    }
  );

  // Handle form submission
  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      if (isEdit && editingBooking) {
        await updateBookingMutation.mutateAsync({
          id: editingBooking.id,
          data: data
        });
        setShowEditModal(false);
        setEditingBooking(null);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev => 
      prev.includes(bookingId) 
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const handleSelectAll = () => {
    const bookingResults = bookings?.results || [];
    if (selectedBookings.length === bookingResults.length) {
      setSelectedBookings([]);
    } else {
      setSelectedBookings(bookingResults.map(b => b.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedBookings.length === 0) return;
    
    bulkOperationsMutation.mutate({
      action,
      booking_ids: selectedBookings
    });
  };

  const handleStatusChange = (bookingId, newStatus) => {
    updateBookingMutation.mutate({
      id: bookingId,
      data: { status: newStatus }
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

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
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Booking Management</h1>
          <p className="text-dark-300">Manage all vehicle bookings</p>
        </div>
        <div className="flex space-x-2">
          <button className="btn btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          <div className="flex space-x-2">
            <button className="btn btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
            <button className="btn btn-secondary">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBookings.length > 0 && (
        <div className="bg-primary-900/20 border border-primary-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-primary-400">
              {selectedBookings.length} booking(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('confirm')}
                className="btn btn-sm btn-primary"
              >
                Confirm
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="btn btn-sm btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="btn btn-sm btn-secondary"
              >
                Export Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBookings.length === (bookings?.results?.length || 0) && (bookings?.results?.length || 0) > 0}
                    onChange={handleSelectAll}
                    className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {(bookings?.results || []).map((booking) => (
                <tr key={booking.id} className="hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBookings.includes(booking.id)}
                      onChange={() => handleSelectBooking(booking.id)}
                      className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      #{booking.id}
                    </div>
                    <div className="text-sm text-dark-300">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-dark-600 flex items-center justify-center">
                          <User className="h-4 w-4 text-dark-300" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">
                          {booking.user?.first_name} {booking.user?.last_name}
                        </div>
                        <div className="text-sm text-dark-300">
                          {booking.user?.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-lg bg-dark-600 flex items-center justify-center">
                          <Car className="h-4 w-4 text-dark-300" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-white">
                          {booking.vehicle?.name}
                        </div>
                        <div className="text-sm text-dark-300">
                          {booking.vehicle?.brand?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <div>
                        <div>{new Date(booking.start_date).toLocaleDateString()}</div>
                        <div>to {new Date(booking.end_date).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {formatPrice(booking.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1">{booking.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setViewingBooking(booking);
                          setShowViewModal(true);
                        }}
                        className="text-primary-400 hover:text-primary-300"
                        title="View Booking"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingBooking(booking);
                          setShowEditModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                        title="Edit Booking"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to cancel this booking?')) {
                            updateBookingMutation.mutate({
                              id: booking.id,
                              data: { status: 'cancelled' }
                            });
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Cancel Booking"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                        className="bg-dark-700 text-white text-xs px-2 py-1 rounded border border-dark-600"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(bookings?.count || 0) > 10 && (
          <div className="bg-dark-700 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-dark-300">
              Showing {bookings?.results?.length || 0} of {bookings?.count || 0} bookings
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-secondary">Previous</button>
              <button className="btn btn-sm btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {showViewModal && viewingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Booking Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingBooking(null);
                }}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Booking Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Booking Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Booking ID</label>
                    <p className="text-white font-medium">#{viewingBooking.id}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingBooking.status)}`}>
                        {getStatusIcon(viewingBooking.status)}
                        <span className="ml-1">{viewingBooking.status}</span>
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Start Date</label>
                    <p className="text-white font-medium">
                      {new Date(viewingBooking.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">End Date</label>
                    <p className="text-white font-medium">
                      {new Date(viewingBooking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Duration</label>
                    <p className="text-white font-medium">
                      {Math.ceil((new Date(viewingBooking.end_date) - new Date(viewingBooking.start_date)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Total Amount</label>
                    <p className="text-white font-medium text-lg">
                      ${viewingBooking.total_amount || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Customer Name</label>
                    <p className="text-white font-medium">
                      {viewingBooking.customer?.first_name} {viewingBooking.customer?.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Email</label>
                    <p className="text-white font-medium">{viewingBooking.customer?.email}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Phone</label>
                    <p className="text-white font-medium">{viewingBooking.customer?.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Member Since</label>
                    <p className="text-white font-medium">
                      {new Date(viewingBooking.customer?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Vehicle Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Vehicle Name</label>
                    <p className="text-white font-medium">{viewingBooking.vehicle?.name}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Brand & Model</label>
                    <p className="text-white font-medium">
                      {viewingBooking.vehicle?.brand?.name} {viewingBooking.vehicle?.model}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Daily Rate</label>
                    <p className="text-white font-medium">
                      ${viewingBooking.vehicle?.daily_rate}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </label>
                    <p className="text-white font-medium">{viewingBooking.vehicle?.location}</p>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              {viewingBooking.payment && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-dark-300 text-sm">Payment Status</label>
                      <p className="text-white font-medium">{viewingBooking.payment.status}</p>
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm">Payment Method</label>
                      <p className="text-white font-medium">{viewingBooking.payment.payment_method}</p>
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm">Amount Paid</label>
                      <p className="text-white font-medium">${viewingBooking.payment.amount}</p>
                    </div>
                    <div>
                      <label className="text-dark-300 text-sm">Payment Date</label>
                      <p className="text-white font-medium">
                        {new Date(viewingBooking.payment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingBooking(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingBooking(viewingBooking);
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="btn btn-primary"
              >
                Edit Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && editingBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Booking</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingBooking(null);
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
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingBooking.start_date}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingBooking.end_date}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingBooking.status}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="total_amount"
                    defaultValue={editingBooking.total_amount}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="special_instructions"
                  defaultValue={editingBooking.special_instructions}
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingBooking(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;
