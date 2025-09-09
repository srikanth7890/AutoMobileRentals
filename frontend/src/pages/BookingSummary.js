import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
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
  DollarSign
} from 'lucide-react';
import { bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const BookingSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const { data: booking, isLoading, error } = useQuery(
    ['booking-summary', id],
    () => bookingAPI.getBookingSummary(id),
    {
      enabled: !!id
    }
  );

  const createPaymentMutation = useMutation(
    (paymentData) => bookingAPI.createPayment(id, paymentData),
    {
      onSuccess: (data) => {
        alert('Payment successful! Your booking is confirmed.');
        navigate('/my-bookings');
      },
      onError: (error) => {
        alert('Payment failed. Please try again.');
        console.error('Payment error:', error);
      }
    }
  );

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    try {
      await createPaymentMutation.mutateAsync({
        payment_method: paymentMethod,
        amount: booking.total_amount
      });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessingPayment(false);
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
          <h1 className="text-3xl font-bold text-white">Booking Summary</h1>
          <p className="text-dark-300 mt-2">Review your booking details and complete payment</p>
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
                  <label className="text-dark-300 text-sm">Model</label>
                  <p className="text-white font-medium">{booking.vehicle?.model}</p>
                </div>
                <div>
                  <label className="text-dark-300 text-sm">Year</label>
                  <p className="text-white font-medium">{booking.vehicle?.year}</p>
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
                  <label className="text-dark-300 text-sm">Booking Status</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'confirmed' 
                      ? 'text-green-400 bg-green-900/50' 
                      : booking.status === 'pending'
                      ? 'text-yellow-400 bg-yellow-900/50'
                      : 'text-gray-400 bg-gray-900/50'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Payment Summary
              </h2>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-dark-300">Daily Rate</span>
                  <span className="text-white">${booking.vehicle?.daily_rate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Duration</span>
                  <span className="text-white">
                    {Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Subtotal</span>
                  <span className="text-white">
                    ${(booking.vehicle?.daily_rate * Math.ceil((new Date(booking.end_date) - new Date(booking.start_date)) / (1000 * 60 * 60 * 24))).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-300">Taxes & Fees</span>
                  <span className="text-white">$0.00</span>
                </div>
                <hr className="border-dark-600" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-primary-400">${booking.total_amount}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-dark-300 text-sm font-medium mb-3">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <CreditCard className="h-4 w-4 mr-2" />
                    <span className="text-white">Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="upi"
                      checked={paymentMethod === 'upi'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-white">UPI</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="netbanking"
                      checked={paymentMethod === 'netbanking'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <span className="text-white">Net Banking</span>
                  </label>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessingPayment || createPaymentMutation.isLoading}
                className="btn btn-primary btn-lg w-full"
              >
                {isProcessingPayment || createPaymentMutation.isLoading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                Complete Payment
              </button>

              <p className="text-xs text-dark-300 mt-3 text-center">
                By completing payment, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
