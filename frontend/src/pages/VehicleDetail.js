import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import { 
  Car, 
  Users, 
  Fuel, 
  Calendar, 
  MapPin, 
  Shield, 
  Star,
  ArrowLeft,
  CheckCircle,
  Clock
} from 'lucide-react';
import { vehicleAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const VehicleDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: vehicle, isLoading, error } = useQuery(
    ['vehicle', id],
    () => vehicleAPI.getVehicle(id),
    {
      enabled: !!id
    }
  );

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

  if (error || !vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">Vehicle not found</p>
          <Link to="/vehicles" className="btn btn-primary">
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const images = vehicle.images || [];
  const allImages = vehicle.main_image_url ? [vehicle.main_image_url, ...images.map(img => img.image)] : images.map(img => img.image);

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/vehicles"
          className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-w-16 aspect-h-9">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={vehicle.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-96 bg-dark-700 rounded-lg flex items-center justify-center">
                  <Car className="h-24 w-24 text-dark-500" />
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-w-16 aspect-h-9 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-primary-500' : ''
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.name} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{vehicle.name}</h1>
              <p className="text-xl text-dark-300 mb-4">{vehicle.brand.name}</p>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-900/50 text-green-300">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Available
                </span>
                <span className="text-dark-300">Model Year: {vehicle.model_year}</span>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Pricing</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-300">Daily Rate:</span>
                  <span className="text-2xl font-bold text-white">
                    {formatPrice(vehicle.daily_rate)}
                  </span>
                </div>
                {vehicle.weekly_rate && (
                  <div className="flex justify-between">
                    <span className="text-dark-300">Weekly Rate:</span>
                    <span className="text-lg font-semibold text-white">
                      {formatPrice(vehicle.weekly_rate)}
                    </span>
                  </div>
                )}
                {vehicle.monthly_rate && (
                  <div className="flex justify-between">
                    <span className="text-dark-300">Monthly Rate:</span>
                    <span className="text-lg font-semibold text-white">
                      {formatPrice(vehicle.monthly_rate)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  <span className="text-dark-300">{vehicle.seating_capacity} Seats</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Fuel className="h-5 w-5 text-primary-500" />
                  <span className="text-dark-300 capitalize">{vehicle.fuel_type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-primary-500" />
                  <span className="text-dark-300 capitalize">{vehicle.transmission}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary-500" />
                  <span className="text-dark-300">{vehicle.location}</span>
                </div>
              </div>
              {vehicle.engine_capacity && (
                <div className="mt-4">
                  <span className="text-dark-300">Engine: {vehicle.engine_capacity}</span>
                </div>
              )}
              {vehicle.mileage && (
                <div className="mt-2">
                  <span className="text-dark-300">Mileage: {vehicle.mileage}</span>
                </div>
              )}
            </div>

            {/* Features */}
            {vehicle.features && vehicle.features.length > 0 && (
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-dark-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {vehicle.description && (
              <div className="bg-dark-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                <p className="text-dark-300">{vehicle.description}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {isAuthenticated ? (
                <Link
                  to={`/vehicles/${vehicle.id}/book`}
                  className="btn btn-primary btn-lg w-full"
                >
                  Book This Vehicle
                </Link>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="btn btn-primary btn-lg w-full"
                  >
                    Login to Book
                  </Link>
                  <p className="text-center text-sm text-dark-300">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-400 hover:text-primary-300">
                      Sign up here
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
