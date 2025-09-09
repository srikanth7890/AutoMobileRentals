import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, Fuel, Calendar, MapPin } from 'lucide-react';

const VehicleCard = ({ vehicle }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      <div className="aspect-w-16 aspect-h-9 mb-4">
        {vehicle.main_image_url ? (
          <img
            src={vehicle.main_image_url}
            alt={vehicle.name}
            className="w-full h-48 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-48 bg-dark-700 rounded-lg flex items-center justify-center">
            <Car className="h-16 w-16 text-dark-500" />
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
          <p className="text-dark-300">{vehicle.brand.name}</p>
        </div>

        <div className="flex items-center justify-between text-sm text-dark-300">
          <div className="flex items-center space-x-1">
            <Users className="h-4 w-4" />
            <span>{vehicle.seating_capacity} seats</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span className="capitalize">{vehicle.fuel_type}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-sm text-dark-300">
          <MapPin className="h-4 w-4" />
          <span>{vehicle.location}</span>
        </div>

        {vehicle.features && vehicle.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-dark-700 text-xs text-dark-300 rounded"
              >
                {feature}
              </span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="px-2 py-1 bg-dark-700 text-xs text-dark-300 rounded">
                +{vehicle.features.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-2xl font-bold text-white">
              {formatPrice(vehicle.daily_rate)}
            </span>
            <span className="text-dark-300 text-sm">/day</span>
          </div>
          <Link
            to={`/vehicles/${vehicle.id}`}
            className="btn btn-primary btn-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
