import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { vehicleAPI, bookingAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import 'react-datepicker/dist/react-datepicker.css';

const BookingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pickupTime, setPickupTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const { data: vehicle, isLoading } = useQuery(
    ['vehicle', id],
    () => vehicleAPI.getVehicle(id),
    {
      enabled: !!id
    }
  );

  const checkAvailabilityMutation = useMutation(
    ({ vehicleId, startDate, endDate }) => 
      vehicleAPI.checkAvailability(vehicleId, startDate, endDate),
    {
      onSuccess: (data) => {
        setIsAvailable(data.is_available);
        setAvailabilityChecked(true);
        setIsCheckingAvailability(false);
      },
      onError: () => {
        setIsAvailable(false);
        setAvailabilityChecked(true);
        setIsCheckingAvailability(false);
      }
    }
  );

  const createBookingMutation = useMutation(
    (bookingData) => bookingAPI.createBooking(bookingData),
    {
      onSuccess: (data) => {
        navigate(`/bookings/${data.id}/summary`);
      },
      onError: (error) => {
        console.error('Booking creation error:', error);
        const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                           error.response?.data?.error || 
                           'Failed to create booking. Please try again.';
        alert(errorMessage);
      }
    }
  );

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
    setAvailabilityChecked(false);
    setIsAvailable(false);
  };

  const checkAvailability = async () => {
    if (!startDate || !endDate) return;
    
    setIsCheckingAvailability(true);
    checkAvailabilityMutation.mutate({
      vehicleId: id,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const onSubmit = async (data) => {
    if (!isAvailable) {
      alert('Please check vehicle availability first');
      return;
    }

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      alert('Start date cannot be in the past');
      return;
    }
    
    if (startDate >= endDate) {
      alert('End date must be after start date');
      return;
    }
    
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      alert('Maximum booking duration is 30 days');
      return;
    }

    const bookingData = {
      vehicle: parseInt(id),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      pickup_time: pickupTime,
      return_time: returnTime,
      pickup_location: data.pickup_location,
      return_location: data.return_location,
      special_requests: data.special_requests
    };

    createBookingMutation.mutate(bookingData);
  };

  const calculateTotal = () => {
    if (!startDate || !endDate || !vehicle) return 0;
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const subtotal = days * parseFloat(vehicle.daily_rate);
    const tax = subtotal * 0.10; // 10% tax
    return subtotal + tax;
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Vehicle not found</p>
          <button onClick={() => navigate('/vehicles')} className="btn btn-primary">
            Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/vehicles/${id}`)}
          className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicle Details
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800 rounded-lg p-6">
              <h1 className="text-2xl font-bold text-white mb-6">Book Your Vehicle</h1>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Date Selection */}
                <div>
                  <label className="label">Select Dates</label>
                  <div className="mt-2">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      startDate={startDate}
                      endDate={endDate}
                      selectsRange
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)} // 90 days from now
                      placeholderText="Select start and end dates"
                      className="input w-full"
                      dateFormat="MMM dd, yyyy"
                    />
                  </div>
                  {errors.dates && (
                    <p className="text-red-400 text-sm mt-1">{errors.dates.message}</p>
                  )}
                </div>

                {/* Availability Check */}
                {startDate && endDate && (
                  <div>
                    <button
                      type="button"
                      onClick={checkAvailability}
                      disabled={isCheckingAvailability}
                      className="btn btn-outline"
                    >
                      {isCheckingAvailability ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : null}
                      Check Availability
                    </button>
                    
                    {availabilityChecked && (
                      <div className={`mt-2 p-3 rounded-md flex items-center ${
                        isAvailable ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                      }`}>
                        {isAvailable ? (
                          <CheckCircle className="h-5 w-5 mr-2" />
                        ) : (
                          <AlertCircle className="h-5 w-5 mr-2" />
                        )}
                        {isAvailable ? 'Vehicle is available for selected dates' : 'Vehicle is not available for selected dates'}
                      </div>
                    )}
                  </div>
                )}

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Pickup Time</label>
                    <input
                      type="time"
                      className="input mt-1"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label">Return Time</label>
                    <input
                      type="time"
                      className="input mt-1"
                      value={returnTime}
                      onChange={(e) => setReturnTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Pickup Location</label>
                    <input
                      type="text"
                      className="input mt-1"
                      placeholder="Enter pickup location"
                      {...register('pickup_location', { required: 'Pickup location is required' })}
                    />
                    {errors.pickup_location && (
                      <p className="text-red-400 text-sm mt-1">{errors.pickup_location.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="label">Return Location</label>
                    <input
                      type="text"
                      className="input mt-1"
                      placeholder="Enter return location"
                      {...register('return_location', { required: 'Return location is required' })}
                    />
                    {errors.return_location && (
                      <p className="text-red-400 text-sm mt-1">{errors.return_location.message}</p>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="label">Special Requests</label>
                  <textarea
                    rows={4}
                    className="input mt-1"
                    placeholder="Any special requests or notes..."
                    {...register('special_requests')}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isAvailable || createBookingMutation.isLoading}
                  className="btn btn-primary btn-lg w-full"
                >
                  {createBookingMutation.isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Proceed to Payment
                </button>
              </form>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-4">Booking Summary</h2>
              
              {/* Vehicle Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-white mb-2">{vehicle.name}</h3>
                <p className="text-dark-300 text-sm">{vehicle.brand.name}</p>
                {vehicle.main_image_url && (
                  <img
                    src={vehicle.main_image_url}
                    alt={vehicle.name}
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>

              {/* Booking Details */}
              {startDate && endDate && (
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Duration:</span>
                    <span className="text-white">{calculateDays()} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Daily Rate:</span>
                    <span className="text-white">${vehicle.daily_rate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Subtotal:</span>
                    <span className="text-white">${(calculateDays() * parseFloat(vehicle.daily_rate)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-dark-300">Tax (10%):</span>
                    <span className="text-white">${(calculateDays() * parseFloat(vehicle.daily_rate) * 0.10).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-dark-600 pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white">Total:</span>
                      <span className="font-bold text-white text-lg">${calculateTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Features */}
              <div>
                <h3 className="font-semibold text-white mb-2">What's Included</h3>
                <ul className="space-y-1 text-sm text-dark-300">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Full Insurance Coverage
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    24/7 Roadside Assistance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Free Cancellation
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    No Hidden Fees
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
