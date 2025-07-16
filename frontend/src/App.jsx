import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

const Home = React.lazy(() => import('./pages/Home.jsx'));
const Login = React.lazy(() => import('./pages/Login.jsx'));
const Register = React.lazy(() => import('./pages/Register.jsx'));
const Profile = React.lazy(() => import('./pages/Profile.jsx'));
const Services = React.lazy(() => import('./pages/Services.jsx'));
const Products = React.lazy(() => import('./pages/Products.jsx'));
const Blogs = React.lazy(() => import('./pages/Blogs.jsx'));
const Videos = React.lazy(() => import('./pages/Videos.jsx'));
const ServiceDetails = React.lazy(() => import('./pages/ServiceDetails.jsx'));
const BookingSuccess = React.lazy(() => import('./pages/BookingSuccess.jsx'));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails.jsx'));
const PurchaseSuccess = React.lazy(() => import('./pages/PurchaseSuccess.jsx'));
const BlogDetails = React.lazy(() => import('./pages/BlogDetails.jsx'));
const BookingHistory = React.lazy(() => import('./pages/BookingHistory.jsx'));
const PurchaseHistory = React.lazy(() => import('./pages/PurchaseHistory.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard.jsx'));
const Contact = React.lazy(() => import('./pages/Contact.jsx'));
const Settings = React.lazy(() => import('./pages/Settings.jsx'));
const Wallet = React.lazy(() => import('./pages/Wallet.jsx'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function ProtectedLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Home />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Profile />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/services" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Services />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/services/:id" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ServiceDetails />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Products />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/products/:id" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <ProductDetails />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/blogs" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Blogs />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/blogs/:id" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <BlogDetails />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/videos" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Videos />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/booking-success" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <BookingSuccess />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/purchase-success" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PurchaseSuccess />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/booking-history" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <BookingHistory />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/purchase-history" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <PurchaseHistory />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <AdminDashboard />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/contact" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Contact />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Settings />
                </ProtectedLayout>
              </ProtectedRoute>   
            } />
            <Route path="/wallet" element={
              <ProtectedRoute>
                <ProtectedLayout>
                  <Wallet />
                </ProtectedLayout>
              </ProtectedRoute>
            } />
            {/* Add more routes as you build more pages */}
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
