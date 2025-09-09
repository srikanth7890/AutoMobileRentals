import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import VehicleCard from '../components/VehicleCard';
import LoadingSpinner from '../components/LoadingSpinner';

const VehicleList = () => {
  const [filters, setFilters] = useState({
    search: '',
    brand: '',
    category: '',
    fuel_type: '',
    transmission: '',
    min_price: '',
    max_price: '',
    min_seating: '',
    location: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: vehicles, isLoading, error } = useQuery(
    ['vehicles', filters],
    () => vehicleAPI.getVehicles(filters),
    {
      keepPreviousData: true
    }
  );

  const { data: categories } = useQuery(
    'categories',
    vehicleAPI.getCategories
  );

  const { data: brands } = useQuery(
    'brands',
    vehicleAPI.getBrands
  );

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      brand: '',
      category: '',
      fuel_type: '',
      transmission: '',
      min_price: '',
      max_price: '',
      min_seating: '',
      location: ''
    });
  };

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'cng', label: 'CNG' }
  ];

  const transmissionTypes = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' }
  ];

  return (
    <div className="min-h-screen bg-dark-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Available Vehicles</h1>
          <p className="text-dark-300">
            Find the perfect vehicle for your next adventure
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-dark-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
                <input
                  type="text"
                  placeholder="Search vehicles..."
                  className="input pl-10 w-full"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Brand */}
              <div>
                <label className="label">Brand</label>
                <select
                  className="input mt-1"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">All Brands</option>
                  {brands?.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="label">Category</label>
                <select
                  className="input mt-1"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fuel Type */}
              <div>
                <label className="label">Fuel Type</label>
                <select
                  className="input mt-1"
                  value={filters.fuel_type}
                  onChange={(e) => handleFilterChange('fuel_type', e.target.value)}
                >
                  <option value="">All Fuel Types</option>
                  {fuelTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="label">Transmission</label>
                <select
                  className="input mt-1"
                  value={filters.transmission}
                  onChange={(e) => handleFilterChange('transmission', e.target.value)}
                >
                  <option value="">All Transmissions</option>
                  {transmissionTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="label">Min Price (per day)</label>
                <input
                  type="number"
                  className="input mt-1"
                  placeholder="Min price"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                />
              </div>

              <div>
                <label className="label">Max Price (per day)</label>
                <input
                  type="number"
                  className="input mt-1"
                  placeholder="Max price"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                />
              </div>

              {/* Seating Capacity */}
              <div>
                <label className="label">Min Seating</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  className="input mt-1"
                  placeholder="Min seats"
                  value={filters.min_seating}
                  onChange={(e) => handleFilterChange('min_seating', e.target.value)}
                />
              </div>

              {/* Location */}
              <div>
                <label className="label">Location</label>
                <input
                  type="text"
                  className="input mt-1"
                  placeholder="Enter location"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {showFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-dark-300">
            {isLoading ? 'Loading...' : `${vehicles?.count || 0} vehicles found`}
          </p>
        </div>

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">Error loading vehicles. Please try again.</p>
          </div>
        ) : vehicles?.results?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-dark-300">No vehicles found matching your criteria.</p>
            <button
              onClick={clearFilters}
              className="btn btn-primary btn-sm mt-4"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles?.results?.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {vehicles?.count > 20 && (
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

export default VehicleList;
