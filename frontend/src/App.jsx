import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import {
  HomePage,
  EventsListingPage,
  EventDetailPage,
  PartnersPage,
  SeatSelectionPage,
  CheckoutPage
  ,
  LoginPage,
  RegisterPage
} from './pages';

// Admin imports
import { AdminLayout } from './admin/components/layout';
import {
  DashboardPage,
  EventsListPage as AdminEventsListPage,
  EventFormPage,
  OrdersPage,
  CustomersPage,
  DiscountsPage,
  ReviewsPage,
  LocationsPage,
  SectorsPage,
  TicketsPage,
  OrganizersPage,
  ReportsPage,
  AdminPartnersPage
} from './admin/pages';
import { PrivateAdminRoute } from './admin/utils/PrivateAdminRoute';
import { useAdminStore } from './admin/stores';

const NotFound = () => (
  <div className="min-h-screen bg-dark flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white mb-4">404 - Page Not Found</h1>
      <p className="text-gray-400 text-lg">The page you're looking for doesn't exist.</p>
    </div>
  </div>
);

// Root redirect component - checks if user is authenticated
const RootRedirect = () => {
  const token = localStorage.getItem('authToken');
  return token ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />;
};

export const App = () => {
  const [isDark, setIsDark] = useState(false);
  const setAdmin = useAdminStore((state) => state.setAdmin);

  // For demo: set admin to true. In production, check JWT/auth
  useEffect(() => {
    const isAdminUser = localStorage.getItem('isAdminUser') === 'true' || true;
    setAdmin(isAdminUser);
  }, [setAdmin]);

  const handleCartClick = () => {
    window.location.href = '/checkout';
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Public User Routes - Protected by auth check in Layout */}
        <Route
          path="/*"
          element={
            <Layout onCartClick={handleCartClick}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/events" element={<EventsListingPage />} />
                <Route path="/partners" element={<PartnersPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/seat-selection/:eventId" element={<SeatSelectionPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                
                {/* Admin Routes */}
                <Route
                  path="/admin/*"
                  element={
                    <PrivateAdminRoute>
                      <AdminLayout isDark={isDark} setIsDark={setIsDark}>
                        <Routes>
                          <Route path="/" element={<DashboardPage />} />
                          
                          {/* Events */}
                          <Route path="/events" element={<AdminEventsListPage />} />
                          <Route path="/events/new" element={<EventFormPage />} />
                          <Route path="/events/:id/edit" element={<EventFormPage />} />
                          
                          {/* Locations */}
                          <Route path="/locations" element={<LocationsPage />} />
                          
                          {/* Sectors */}
                          <Route path="/sectors" element={<SectorsPage />} />
                          
                          {/* Tickets */}
                          <Route path="/tickets" element={<TicketsPage />} />
                          
                          {/* Orders */}
                          <Route path="/orders" element={<OrdersPage />} />
                          
                          {/* Customers */}
                          <Route path="/customers" element={<CustomersPage />} />
                          
                          {/* Organizers */}
                          <Route path="/organizers" element={<OrganizersPage />} />
                          
                          {/* Discounts */}
                          <Route path="/discounts" element={<DiscountsPage />} />
                          
                          {/* Reviews */}
                          <Route path="/reviews" element={<ReviewsPage />} />
                          
                          {/* Partners */}
                          <Route path="/partners" element={<AdminPartnersPage />} />
                          
                          {/* Reports */}
                          <Route path="/reports" element={<ReportsPage />} />
                          
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </AdminLayout>
                    </PrivateAdminRoute>
                  }
                />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
