import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { RestaurantListPage } from './pages/RestaurantListPage';
import { RestaurantDetailsPage } from './pages/RestaurantDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { RewardsPage } from './pages/RewardsPage';
import { WishlistPage } from './pages/WishlistPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SupportPage } from './pages/SupportPage';
import { RestaurantDashboard } from './pages/RestaurantDashboard';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Authenticating session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Access Denied</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Your role ({user.role}) does not have permission to access this portal.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/restaurants" element={<RestaurantListPage />} />
                <Route path="/restaurants/:id" element={<RestaurantDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Customer Authenticated */}
                <Route path="/checkout" element={
                  <ProtectedRoute roles={['CUSTOMER', 'ADMIN', 'RESTAURANT', 'DELIVERY']}>
                    <CheckoutPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderHistoryPage />
                  </ProtectedRoute>
                } />
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderTrackingPage />
                  </ProtectedRoute>
                } />
                <Route path="/rewards" element={
                  <ProtectedRoute>
                    <RewardsPage />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <WishlistPage />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <NotificationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/support" element={
                  <ProtectedRoute>
                    <SupportPage />
                  </ProtectedRoute>
                } />

                {/* Role Specific Portals */}
                <Route path="/restaurant/dashboard" element={
                  <ProtectedRoute roles={['RESTAURANT', 'ADMIN']}>
                    <RestaurantDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/delivery/dashboard" element={
                  <ProtectedRoute roles={['DELIVERY', 'ADMIN']}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
