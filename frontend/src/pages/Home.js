import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Car, Shield, Clock, Star, ArrowRight } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const { data: featuredVehicles, isLoading } = useQuery(
    'featured-vehicles',
    () => vehicleAPI.getVehicles({ available_only: true }),
    {
      select: (data) => data.results?.slice(0, 6) || []
    }
  );

  const features = [
    {
      icon: <Car className="h-8 w-8 text-primary-500" />,
      title: "Wide Selection",
      description: "Choose from a variety of vehicles including cars, SUVs, and luxury vehicles."
    },
    {
      icon: <Shield className="h-8 w-8 text-primary-500" />,
      title: "Safe & Secure",
      description: "All vehicles are fully insured and regularly maintained for your safety."
    },
    {
      icon: <Clock className="h-8 w-8 text-primary-500" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support to assist you with any queries."
    },
    {
      icon: <Star className="h-8 w-8 text-primary-500" />,
      title: "Best Prices",
      description: "Competitive pricing with no hidden fees or charges."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-dark-800 to-dark-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Rent Your Dream
              <span className="text-primary-500"> Vehicle</span>
            </h1>
            <p className="text-xl text-dark-300 mb-8 max-w-3xl mx-auto">
              Discover the perfect vehicle for your journey. From economy cars to luxury vehicles, 
              we have everything you need for a comfortable and memorable trip.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/vehicles"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                Browse Vehicles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="btn btn-outline btn-lg"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Why Choose VehicleRental?
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              We provide exceptional service and quality vehicles to make your journey comfortable and memorable.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-dark-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Vehicles Section */}
      <section className="py-16 bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Featured Vehicles
            </h2>
            <p className="text-dark-300 max-w-2xl mx-auto">
              Check out our most popular vehicles, perfect for your next adventure.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredVehicles?.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/vehicles"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              View All Vehicles
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their vehicle rental needs.
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary-600 hover:bg-primary-50 btn-lg"
          >
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
