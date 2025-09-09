import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import VehicleList from './pages/VehicleList';
import VehicleDetail from './pages/VehicleDetail';
import BookingForm from './pages/BookingForm';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminDashboard from './pages/AdminDashboard';
import AdminVehicleManagement from './pages/admin/AdminVehicleManagement';
import AdminBookingManagement from './pages/admin/AdminBookingManagement';
import AdminCustomerManagement from './pages/admin/AdminCustomerManagement';
import AdminFinancialDashboard from './pages/admin/AdminFinancialDashboard';
import AdminReportingDashboard from './pages/admin/AdminReportingDashboard';
import BookingSummary from './pages/BookingSummary';
import BookingDetail from './pages/BookingDetail';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-dark-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="vehicles" element={<VehicleList />} />
                <Route path="vehicles/:id" element={<VehicleDetail />} />
                <Route path="vehicles/:id/book" element={
                  <ProtectedRoute>
                    <BookingForm />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="my-bookings" element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                } />
                <Route path="bookings/:id" element={
                  <ProtectedRoute>
                    <BookingDetail />
                  </ProtectedRoute>
                } />
                <Route path="bookings/:id/summary" element={
                  <ProtectedRoute>
                    <BookingSummary />
                  </ProtectedRoute>
                } />
                <Route path="admin" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/vehicles" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminVehicleManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/bookings" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminBookingManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/customers" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminCustomerManagement />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/financial" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminFinancialDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/reports" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReportingDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
                <Route path="admin/analytics" element={
                  <ProtectedRoute adminOnly>
                    <AdminLayout>
                      <AdminReportingDashboard />
                    </AdminLayout>
                  </ProtectedRoute>
                } />
              </Route>
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
