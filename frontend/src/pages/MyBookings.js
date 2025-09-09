import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  X,
  Eye,
  Download
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyBookings = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery(
    ['my-bookings', statusFilter],
    () => bookingAPI.getMyBookings({ status: statusFilter || undefined })
  );

  const cancelBookingMutation = useMutation(
    (bookingId) => bookingAPI.cancelBooking(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('my-bookings');
      }
    }
  );

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBookingMutation.mutateAsync(bookingId);
        alert('Booking cancelled successfully');
      } catch (error) {
        alert('Failed to cancel booking. Please try again.');
      }
    }
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
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canCancelBooking = (booking) => {
    const today = new Date();
    const startDate = new Date(booking.start_date);
    return booking.status === 'pending' || booking.status === 'confirmed' && startDate > today;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-dark-300">
            Manage your vehicle rental bookings
          </p>
        </div>

        {/* Filters */}
        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="label">Filter by Status</label>
              <select
                className="input mt-1"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex items-end">
              <Link to="/vehicles" className="btn btn-primary">
                <Car className="h-4 w-4 mr-2" />
                Book New Vehicle
              </Link>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings?.results?.length === 0 ? (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-dark-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Bookings Found</h3>
            <p className="text-dark-300 mb-6">
              {statusFilter ? 'No bookings found with the selected status.' : 'You haven\'t made any bookings yet.'}
            </p>
            <Link to="/vehicles" className="btn btn-primary">
              Browse Vehicles
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings?.results?.map((booking) => (
              <div key={booking.id} className="bg-dark-800 rounded-lg p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    {booking.vehicle.main_image_url ? (
                      <img
                        src={booking.vehicle.main_image_url}
                        alt={booking.vehicle.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-dark-700 rounded-lg flex items-center justify-center">
                        <Car className="h-8 w-8 text-dark-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{booking.vehicle.name}</h3>
                      <p className="text-dark-300">{booking.vehicle.brand.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status}</span>
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="btn btn-outline btn-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      
                      {canCancelBooking(booking) && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancelBookingMutation.isLoading}
                          className="btn btn-outline btn-sm text-red-400 hover:text-red-300 hover:border-red-400"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-dark-300">Start Date</span>
                    <span className="text-white font-medium">
                      {new Date(booking.start_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-dark-300">End Date</span>
                    <span className="text-white font-medium">
                      {new Date(booking.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-dark-300">Duration</span>
                    <span className="text-white font-medium">{booking.total_days} days</span>
                  </div>
                  <div>
                    <span className="block text-dark-300">Total Amount</span>
                    <span className="text-white font-bold text-lg">
                      {formatPrice(booking.total_amount)}
                    </span>
                  </div>
                </div>

                {booking.pickup_location && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="block text-dark-300">Pickup Location</span>
                        <span className="text-white">{booking.pickup_location}</span>
                      </div>
                      {booking.return_location && (
                        <div>
                          <span className="block text-dark-300">Return Location</span>
                          <span className="text-white">{booking.return_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {booking.special_requests && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <span className="block text-dark-300 text-sm mb-1">Special Requests</span>
                    <p className="text-white text-sm">{booking.special_requests}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {bookings?.count > 20 && (
          <div className="mt-12 flex justify-center">
            <div className="flex space-x-2">
              <button className="btn btn-outline btn-sm">Previous</button>
              <button className="btn btn-primary btn-sm">1</button>
              <button className="btn btn-outline btn-sm">2</button>
              <button className="btn btn-outline btn-sm">3</button>
              <button className="btn btn-outline btn-sm">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
