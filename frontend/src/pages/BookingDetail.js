import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Car,
  User,
  DollarSign,
  X,
  Edit,
  Trash2
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: booking, isLoading, error } = useQuery(
    ['booking-detail', id],
    () => bookingAPI.getBooking(id),
    {
      enabled: !!id
    }
  );

  const cancelBookingMutation = useMutation(
    (bookingId) => bookingAPI.cancelBooking(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('booking-detail');
        queryClient.invalidateQueries('my-bookings');
        setShowCancelModal(false);
        alert('Booking cancelled successfully');
      },
      onError: (error) => {
        alert('Failed to cancel booking. Please try again.');
        console.error('Cancel error:', error);
      }
    }
  );

  const handleCancelBooking = () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Booking Not Found</h2>
          <p className="text-dark-300 mb-4">The booking you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/my-bookings')}
            className="btn btn-primary"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'Not specified';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
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

  const canCancel = booking.status === 'pending' || booking.status === 'confirmed';
  const canEdit = booking.status === 'pending';
  const canPay = booking.status === 'pending' && booking.payment_status === 'pending';

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-primary-400 hover:text-primary-300 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">Booking Details</h1>
              <p className="text-dark-300 mt-2">Booking ID: #{booking.id}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Vehicle Information */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Car className="h-5 w-5 mr-2" />
                Vehicle Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-dark-300 text-sm">Vehicle Name</label>
                  <p className="text-white font-medium">{booking.vehicle?.name}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Brand</label>
                  <p className="text-white font-medium">{booking.vehicle?.brand?.name}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Model Year</label>
                  <p className="text-white font-medium">{booking.vehicle?.model_year}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Category</label>
                  <p className="text-white font-medium">{booking.vehicle?.category?.name}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Fuel Type</label>
                  <p className="text-white font-medium">{booking.vehicle?.fuel_type}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Transmission</label>
                  <p className="text-white font-medium">{booking.vehicle?.transmission}</p>
                </div>
              </div>
              {booking.vehicle?.main_image_url && (
                <div className="mt-4">
                  <img
                    src={booking.vehicle.main_image_url}
                    alt={booking.vehicle.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* Booking Information */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Booking Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Start Date
                  </label>
                  <p className="text-white font-medium">{formatDate(booking.start_date)}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    End Date
                  </label>
                  <p className="text-white font-medium">{formatDate(booking.end_date)}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Pickup Time
                  </label>
                  <p className="text-white font-medium">{formatTime(booking.pickup_time)}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Return Time
                  </label>
                  <p className="text-white font-medium">{formatTime(booking.return_time)}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Pickup Location
                  </label>
                  <p className="text-white font-medium">{booking.pickup_location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Return Location
                  </label>
                  <p className="text-white font-medium">{booking.return_location || 'Not specified'}</p>
                </div>
              </div>
              {booking.special_requests && (
                <div className="mt-4">
                  <label className="text-dark-300 text-sm">Special Requests</label>
                  <p className="text-white font-medium">{booking.special_requests}</p>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-dark-300 text-sm">Name</label>
                  <p className="text-white font-medium">{booking.user?.first_name} {booking.user?.last_name}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Email</label>
                  <p className="text-white font-medium">{booking.user?.email}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Phone</label>
                  <p className="text-white font-medium">{booking.user?.phone_number || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Payment Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    booking.payment_status === 'paid' 
                      ? 'text-green-400 bg-green-900/50' 
                      : 'text-yellow-400 bg-yellow-900/50'
                  }`}>
                    {booking.payment_status}
                  </span>
                </div>
              </div>
            </div>

            {/* Status History */}
            {booking.status_history && booking.status_history.length > 0 && (
              <div className="bg-dark-800 rounded-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4">Status History</h2>
                <div className="space-y-3">
                  {booking.status_history.map((history, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">
                          {history.old_status ? `${history.old_status} → ${history.new_status}` : `Status: ${history.new_status}`}
                        </p>
                        <p className="text-dark-300 text-sm">{history.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-dark-300 text-sm">
                          {new Date(history.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-dark-300 text-xs">
                          by {history.changed_by?.first_name} {history.changed_by?.last_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions & Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Booking Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-dark-300">Daily Rate</span>
                  <span className="text-white">${booking.daily_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Duration</span>
                  <span className="text-white">{booking.total_days} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Subtotal</span>
                  <span className="text-white">${booking.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Taxes & Fees</span>
                  <span className="text-white">${booking.tax_amount}</span>
                </div>
                <hr className="border-dark-600" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400">${booking.total_amount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canPay && (
                  <button
                    onClick={() => navigate(`/bookings/${booking.id}/summary`)}
                    className="btn btn-primary w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Complete Payment
                  </button>
                )}
                
                {canEdit && (
                  <button
                    onClick={() => navigate(`/vehicles/${booking.vehicle.id}/book`)}
                    className="btn btn-secondary w-full"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Booking
                  </button>
                )}
                
                {canCancel && (
                  <button
                    onClick={handleCancelBooking}
                    disabled={cancelBookingMutation.isLoading}
                    className="btn btn-danger w-full"
                  >
                    {cancelBookingMutation.isLoading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Cancel Booking
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="btn btn-outline w-full"
                >
                  View All Bookings
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-dark-600">
                <div className="text-xs text-dark-300 space-y-1">
                  <p>Created: {formatDate(booking.created_at)}</p>
                  <p>Last Updated: {formatDate(booking.updated_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
