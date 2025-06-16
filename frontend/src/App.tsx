import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage'; // Assuming you'll create/move HomePage to pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientListPage from './pages/client/ClientListPage';
import ClientFormPage from './pages/client/ClientFormPage';
import SellerListPage from './pages/seller/SellerListPage';
import SellerFormPage from './pages/seller/SellerFormPage';
import ProductListPage from './pages/product/ProductListPage';
import ProductFormPage from './pages/product/ProductFormPage';
import OrderListPage from './pages/order/OrderListPage';
import OrderFormPage from './pages/order/OrderFormPage';
import OrderDetailPage from './pages/order/OrderDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css'; // Keep or remove as needed

// Placeholder for HomePage if not moved yet - you might want to create it properly
// For now, to avoid breaking, we can redefine it or ensure it's created.
// For this task, let's assume HomePage will be a simple component in ./pages/HomePage.tsx
// If it doesn't exist, this will cause an error later, but it's out of scope for the current changes.

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes that use MainLayout and might be public or protected */}
        {/* HomePage is public here, but uses MainLayout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            }
          />
          {/* Client Management Routes */}
          <Route
            path="/clients"
            element={
              <MainLayout>
                <ClientListPage />
              </MainLayout>
            }
          />
          <Route
            path="/clients/new"
            element={
              <MainLayout>
                <ClientFormPage />
              </MainLayout>
            }
          />
          <Route
            path="/clients/edit/:id"
            element={
              <MainLayout>
                <ClientFormPage />
              </MainLayout>
            }
          />
          {/* Seller Management Routes */}
          <Route
            path="/sellers"
            element={
              <MainLayout>
                <SellerListPage />
              </MainLayout>
            }
          />
          <Route
            path="/sellers/new"
            element={
              <MainLayout>
                <SellerFormPage />
              </MainLayout>
            }
          />
          <Route
            path="/sellers/edit/:id"
            element={
              <MainLayout>
                <SellerFormPage />
              </MainLayout>
            }
          />
          {/* Product Management Routes */}
          <Route
            path="/products"
            element={
              <MainLayout>
                <ProductListPage />
              </MainLayout>
            }
          />
          <Route
            path="/products/new"
            element={
              <MainLayout>
                <ProductFormPage />
              </MainLayout>
            }
          />
          <Route
            path="/products/edit/:id"
            element={
              <MainLayout>
                <ProductFormPage />
              </MainLayout>
            }
          />
          {/* Order Management Routes */}
          <Route
            path="/orders"
            element={
              <MainLayout>
                <OrderListPage />
              </MainLayout>
            }
          />
          <Route
            path="/orders/new"
            element={
              <MainLayout>
                <OrderFormPage />
              </MainLayout>
            }
          />
          <Route
            path="/orders/edit/:id"
            element={
              <MainLayout>
                <OrderFormPage />
              </MainLayout>
            }
          />
          <Route
            path="/orders/view/:id"
            element={
              <MainLayout>
                <OrderDetailPage />
              </MainLayout>
            }
          />
          {/* Profile Page Route */}
          <Route
            path="/profile"
            element={
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            }
          />
          {/* Add other protected routes that use MainLayout here */}
        </Route>

        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
