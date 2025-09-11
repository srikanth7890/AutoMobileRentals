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
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  X
} from 'lucide-react';
import { adminCustomerAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminCustomerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [viewingCustomer, setViewingCustomer] = useState(null);

  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customersData, isLoading } = useQuery(
    ['admin-customers', { search: searchTerm, status: statusFilter }],
    () => adminCustomerAPI.getCustomers({ 
      search: searchTerm, 
      status: statusFilter !== 'all' ? statusFilter : undefined
    })
  );
  
  // Ensure customers data is properly structured
  const customers = customersData || { results: [], count: 0 };

  // Create customer mutation
  const createCustomerMutation = useMutation(
    (data) => adminCustomerAPI.createCustomer(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-customers');
        setShowAddModal(false);
      },
    }
  );

  // Delete customer mutation
  const deleteCustomerMutation = useMutation(
    (id) => adminCustomerAPI.updateCustomer(id, { is_active: false }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-customers');
      },
    }
  );

  // Bulk operations mutation
  const bulkOperationsMutation = useMutation(
    (data) => adminCustomerAPI.bulkOperations(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-customers');
        setSelectedCustomers([]);
      },
    }
  );

  // Update customer mutation
  const updateCustomerMutation = useMutation(
    ({ id, data }) => adminCustomerAPI.updateCustomer(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-customers');
      },
    }
  );

  // Handle form submission
  const handleSubmit = async (e, isEdit = false) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Convert is_active to boolean for edit operations
    if (isEdit && data.is_active) {
      data.is_active = data.is_active === 'active';
    }
    
    // Validate password length for new customers
    if (!isEdit && data.password && data.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    
    
    try {
      if (isEdit && editingCustomer) {
        await updateCustomerMutation.mutateAsync({
          id: editingCustomer.id,
          data: data
        });
        setShowEditModal(false);
        setEditingCustomer(null);
      } else {
        // Create new customer
        await createCustomerMutation.mutateAsync(data);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      console.error('Error details:', error.response?.data);
      
      // Show user-friendly error message
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.password) {
          alert(`Password error: ${errorData.password[0]}`);
        } else if (errorData.email) {
          alert(`Email error: ${errorData.email[0]}`);
        } else if (errorData.username) {
          alert(`Username error: ${errorData.username[0]}`);
        } else {
          alert('Error creating customer. Please check all fields.');
        }
      }
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    const customerResults = customers?.results || [];
    if (selectedCustomers.length === customerResults.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customerResults.map(c => c.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedCustomers.length === 0) return;
    
    bulkOperationsMutation.mutate({
      action,
      customer_ids: selectedCustomers
    });
  };


  // Handle export
  const handleExport = async () => {
    try {
      const response = await adminCustomerAPI.exportCustomers({
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      
      // Create blob and download
      const blob = new Blob([response], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'customers_export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting customers:', error);
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
      case 'active':
        return 'text-green-400 bg-green-900/50';
      case 'inactive':
        return 'text-red-400 bg-red-900/50';
      case 'suspended':
        return 'text-yellow-400 bg-yellow-900/50';
      default:
        return 'text-gray-400 bg-gray-900/50';
    }
  };

  const getCustomerStatus = (customer) => {
    if (!customer.is_active) return 'inactive';
    if (customer.is_suspended) return 'suspended';
    return 'active';
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Customer Management</h1>
          <p className="text-dark-300">Manage your customer base</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={handleExport}
            className="btn btn-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
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
              placeholder="Search customers..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          <select className="input">
            <option>All Registration Dates</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
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
      {selectedCustomers.length > 0 && (
        <div className="bg-primary-900/20 border border-primary-500/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-primary-400">
              {selectedCustomers.length} customer(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="btn btn-sm btn-primary"
              >
                Activate
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="btn btn-sm btn-secondary"
              >
                Suspend
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

      {/* Customers Table */}
      <div className="bg-dark-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCustomers.length === (customers?.results?.length || 0) && (customers?.results?.length || 0) > 0}
                    onChange={handleSelectAll}
                    className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Total Bookings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-dark-300 uppercase tracking-wider">
                  Total Spent
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
              {(customers?.results || []).map((customer) => (
                <tr key={customer.id} className="hover:bg-dark-700/50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleSelectCustomer(customer.id)}
                      className="rounded border-dark-600 bg-dark-800 text-primary-500 focus:ring-primary-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        <div className="h-12 w-12 rounded-full bg-dark-600 flex items-center justify-center">
                          <User className="h-6 w-6 text-dark-300" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {customer.first_name} {customer.last_name}
                        </div>
                        <div className="text-sm text-dark-300">
                          ID: #{customer.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-white">
                      <div className="flex items-center mb-1">
                        <Mail className="h-4 w-4 mr-2 text-dark-400" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-dark-400" />
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-dark-300">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(customer.date_joined).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-white">
                    {customer.total_bookings || 0}
                  </td>
                  <td className="px-6 py-4 text-sm text-white font-semibold">
                    {formatPrice(customer.total_spent || 0)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(getCustomerStatus(customer))}`}>
                      {getCustomerStatus(customer)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setViewingCustomer(customer);
                          setShowViewModal(true);
                        }}
                        className="text-primary-400 hover:text-primary-300"
                        title="View Customer"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setShowEditModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to deactivate this customer?')) {
                            deleteCustomerMutation.mutate(customer.id);
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
        {(customers?.count || 0) > 10 && (
          <div className="bg-dark-700 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-dark-300">
              Showing {customers?.results?.length || 0} of {customers?.count || 0} customers
            </div>
            <div className="flex space-x-2">
              <button className="btn btn-sm btn-secondary">Previous</button>
              <button className="btn btn-sm btn-secondary">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* View Customer Modal */}
      {showViewModal && viewingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Customer Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCustomer(null);
                }}
                className="text-dark-300 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Full Name</label>
                    <p className="text-white font-medium">
                      {viewingCustomer.first_name} {viewingCustomer.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Username</label>
                    <p className="text-white font-medium">{viewingCustomer.username}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </label>
                    <p className="text-white font-medium">{viewingCustomer.email}</p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      Phone
                    </label>
                    <p className="text-white font-medium">{viewingCustomer.phone_number || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-dark-300 text-sm">Member Since</label>
                    <p className="text-white font-medium">
                      {new Date(viewingCustomer.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-dark-300 text-sm">Status</label>
                    <div className="mt-1">
                      {getCustomerStatus(viewingCustomer)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Statistics */}
              <div className="bg-dark-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Booking Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary-400">
                      {viewingCustomer.total_bookings || 0}
                    </p>
                    <p className="text-dark-300 text-sm">Total Bookings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      ${viewingCustomer.total_spent || 0}
                    </p>
                    <p className="text-dark-300 text-sm">Total Spent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">
                      {viewingCustomer.average_rating || 'N/A'}
                    </p>
                    <p className="text-dark-300 text-sm">Average Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCustomer(null);
                }}
                className="btn btn-secondary"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingCustomer(viewingCustomer);
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}
                className="btn btn-primary"
              >
                Edit Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Customer Modal */}
      {showEditModal && editingCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Edit Customer</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingCustomer(null);
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
                    First Name
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={editingCustomer.first_name}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={editingCustomer.last_name}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingCustomer.email}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    defaultValue={editingCustomer.phone_number}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    name="is_active"
                    defaultValue={editingCustomer.is_active ? 'active' : 'inactive'}
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCustomer(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add New Customer</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-dark-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Username *
                  </label>
                  <input
                    type="text"
                    name="username"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    required
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="date_of_birth"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Driving License
                  </label>
                  <input
                    type="text"
                    name="driving_license"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm font-medium mb-2">
                    Password * (min 8 characters)
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength="8"
                    className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-dark-300 text-sm font-medium mb-2">
                  Address
                </label>
                <textarea
                  name="address"
                  rows={3}
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
                  disabled={createCustomerMutation.isLoading}
                >
                  {createCustomerMutation.isLoading ? 'Creating...' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomerManagement;
