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
  Car,
  DollarSign,
  MapPin,
  X,
  Fuel,
  Settings
} from 'lucide-react';
import { adminVehicleAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminVehicleManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  const queryClient = useQueryClient();

  // Fetch vehicles
  const { data: vehiclesData, isLoading } = useQuery(
    ['admin-vehicles', { search: searchTerm, status: statusFilter, category: categoryFilter }],
    () => adminVehicleAPI.getVehicles({ 
      search: searchTerm, 
      status: statusFilter !== 'all' ? statusFilter : undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined 
    })
  );
  
  // Ensure vehicles data is properly structured
  const vehicles = vehiclesData || { results: [], count: 0 };

  // Fetch categories and brands
  const { data: categoriesData } = useQuery('admin-categories', adminVehicleAPI.getCategories);
  const { data: brandsData } = useQuery('admin-brands', adminVehicleAPI.getBrands);
  
  // Ensure categories and brands are arrays
  const categories = Array.isArray(categoriesData) ? categoriesData : (categoriesData?.results || []);
  const brands = Array.isArray(brandsData) ? brandsData : (brandsData?.results || []);

  // Delete vehicle mutation
  const deleteVehicleMutation = useMutation(
    (id) => adminVehicleAPI.deleteVehicle(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-vehicles');
      },
    }
  );


  // Create vehicle mutation
  const createVehicleMutation = useMutation(
    (data) => adminVehicleAPI.createVehicle(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-vehicles');
        setShowAddModal(false);
      },
    }
  );

  // Update vehicle mutation
  const updateVehicleMutation = useMutation(
    ({ id, data }) => adminVehicleAPI.updateVehicle(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-vehicles');
        setShowEditModal(false);
        setEditingVehicle(null);
      },
    }
  );

  // Handle form submission
  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    // Handle features field - convert comma-separated string to JSON array
    const featuresValue = formData.get('features');
    if (featuresValue) {
      const featuresArray = featuresValue.split(',').map(f => f.trim()).filter(f => f.length > 0);
      formData.set('features', JSON.stringify(featuresArray));
    } else {
      formData.set('features', '[]');
    }
    
    
    try {
      if (isEdit && editingVehicle) {
        await updateVehicleMutation.mutateAsync({
          id: editingVehicle.id,
          data: formData
        });
      } else {
        await createVehicleMutation.mutateAsync(formData);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      const response = await adminVehicleAPI.exportVehicles({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined
      });
      
      // Create download link
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vehicles-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting vehicles:', error);
      alert('Failed to export vehicles. Please try again.');
    }
  };



  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'text-green-400 bg-green-900/50';
      case 'rented':
        return 'text-blue-400 bg-blue-900/50';
      case 'maintenance':
        return 'text-yellow-400 bg-yellow-900/50';
      case 'unavailable':
        return 'text-red-400 bg-red-900/50';
      default:
        return 'text-gray-400 bg-gray-900/50';
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vehicle Management</h1>
          <p className="text-dark-300">Manage your vehicle fleet</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-dark-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark-400" />
            <input
              type="text"
              placeholder="Search vehicles..."
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
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="all">All Categories</option>
            {categories && categories.length > 0 && categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button onClick={() => setShowFiltersModal(true)} className="btn btn-secondary">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </button>
            <button onClick={handleExport} className="btn btn-secondary">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}

      {/* Vehicles Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Daily Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {(vehicles?.results || []).map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-lg bg-dark-600 flex items-center justify-center">
                          <Car className="h-6 w-6 text-dark-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {vehicle.name}
                        </div>
                        <div className="text-sm text-dark-300">
                          {vehicle.brand?.name} • {vehicle.model}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {vehicle.category?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {formatPrice(vehicle.daily_rate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {vehicle.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setViewingVehicle(vehicle);
                          setShowViewModal(true);
                        }}
                        className="text-primary-400 hover:text-primary-300"
                        title="View Vehicle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingVehicle(vehicle);
                          setShowEditModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this vehicle?')) {
                            deleteVehicleMutation.mutate(vehicle.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {(vehicles?.count || 0) > 10 && (
          <div className="bg-dark-700 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-dark-300">
              Showing {vehicles?.results?.length || 0} of {vehicles?.count || 0} vehicles
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-secondary">Previous</button>
              <button className="btn btn-sm btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Vehicle Modal */}
      {showViewModal && viewingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Vehicle Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingVehicle(null);
                }}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Vehicle Image */}
              {viewingVehicle.image && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <img
                    src={viewingVehicle.image}
                    alt={viewingVehicle.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              )}

              {/* Basic Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Vehicle Name</label>
                    <p className="text-white font-medium">{viewingVehicle.name}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Model</label>
                    <p className="text-white font-medium">{viewingVehicle.model}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Brand</label>
                    <p className="text-white font-medium">{viewingVehicle.brand?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Category</label>
                    <p className="text-white font-medium">{viewingVehicle.category?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Year</label>
                    <p className="text-white font-medium">{viewingVehicle.year || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Color</label>
                    <p className="text-white font-medium">{viewingVehicle.color || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <Fuel className="h-4 w-4 mr-1" />
                      Fuel Type
                    </label>
                    <p className="text-white font-medium">{viewingVehicle.fuel_type || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Transmission</label>
                    <p className="text-white font-medium">{viewingVehicle.transmission || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Engine</label>
                    <p className="text-white font-medium">{viewingVehicle.engine || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Seating Capacity</label>
                    <p className="text-white font-medium">{viewingVehicle.seating_capacity || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Rental Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Rental Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Daily Rate</label>
                    <p className="text-white font-medium text-lg">
                      ${viewingVehicle.daily_rate || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Status</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        viewingVehicle.status === 'available' 
                          ? 'text-green-400 bg-green-900/50' 
                          : 'text-red-400 bg-red-900/50'
                      }`}>
                        {viewingVehicle.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Location
                    </label>
                    <p className="text-white font-medium">{viewingVehicle.location}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingVehicle.description && (
                <div className="bg-dark-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
                  <p className="text-dark-300">{viewingVehicle.description}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingVehicle(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingVehicle(viewingVehicle);
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="btn btn-primary"
              >
                Edit Vehicle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vehicle Modal */}
      {showEditModal && editingVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Vehicle</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingVehicle(null);
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
                    Vehicle Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingVehicle.name}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Brand
                  </label>
                  <select
                    name="brand"
                    defaultValue={editingVehicle.brand?.id}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={editingVehicle.category?.id}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Model Year
                  </label>
                  <input
                    type="number"
                    name="model_year"
                    defaultValue={editingVehicle.model_year}
                    min="1900"
                    max="2024"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Fuel Type
                  </label>
                  <select
                    name="fuel_type"
                    defaultValue={editingVehicle.fuel_type}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    defaultValue={editingVehicle.transmission}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Engine Capacity
                  </label>
                  <input
                    type="text"
                    name="engine_capacity"
                    defaultValue={editingVehicle.engine_capacity}
                    placeholder="e.g., 1.5L, 150cc"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Mileage
                  </label>
                  <input
                    type="text"
                    name="mileage"
                    defaultValue={editingVehicle.mileage}
                    placeholder="e.g., 15 kmpl"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Registration Number
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    defaultValue={editingVehicle.registration_number}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Daily Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    defaultValue={editingVehicle.daily_rate}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingVehicle.status}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    defaultValue={editingVehicle.location}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    name="seating_capacity"
                    defaultValue={editingVehicle.seating_capacity}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingVehicle.description}
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  name="features"
                  defaultValue={editingVehicle.features ? editingVehicle.features.join(', ') : ''}
                  placeholder="e.g., AC, GPS, Bluetooth"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingVehicle(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Vehicle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => handleSubmit(e, false)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Vehicle Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Brand *
                  </label>
                  <select
                    name="brand"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Model Year *
                  </label>
                  <input
                    type="number"
                    name="model_year"
                    required
                    min="1900"
                    max="2024"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Fuel Type *
                  </label>
                  <select
                    name="fuel_type"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Transmission *
                  </label>
                  <select
                    name="transmission"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Engine Capacity
                  </label>
                  <input
                    type="text"
                    name="engine_capacity"
                    placeholder="e.g., 1.5L, 150cc"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    name="seating_capacity"
                    required
                    min="1"
                    max="10"
                    defaultValue="4"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Mileage
                  </label>
                  <input
                    type="text"
                    name="mileage"
                    placeholder="e.g., 15 kmpl"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Daily Rate *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="daily_rate"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Weekly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="weekly_rate"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Monthly Rate
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="monthly_rate"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue="available"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Registration Number *
                  </label>
                  <input
                    type="text"
                    name="registration_number"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  name="features"
                  placeholder="e.g., AC, GPS, Bluetooth"
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createVehicleMutation.isLoading}
                >
                  {createVehicleMutation.isLoading ? 'Creating...' : 'Create Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* More Filters Modal */}
      {showFiltersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Price Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Brand
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Brands</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Fuel Type
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Fuel Types</option>
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                  <option value="electric">Electric</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="cng">CNG</option>
                </select>
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Transmission
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Transmissions</option>
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Seating Capacity
                </label>
                <select className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="">All Capacities</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                </select>
              </div>
              
              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Model Year Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min Year"
                    min="1900"
                    max="2024"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    placeholder="Max Year"
                    min="1900"
                    max="2024"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowFiltersModal(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowFiltersModal(false)}
                className="btn btn-primary"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleManagement;
