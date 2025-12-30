import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Componets/Auth/AuthContext';
import ProtectedRoute from './Componets/Login/Signup/ProtectedRoute';

// Lazy load components
const JobListings = lazy(() => import('./Componets/Vendor/accpet'));
const JobHistory = lazy(() => import('./Componets/Vendor/jobhistory'));
const NewHistory = lazy(() => import('./Componets/Product/neworder'));
const JobInProgress = lazy(() => import('./Componets/Vendor/next_accpet'));
const OrderHistory = lazy(() => import('./Componets/Product/orderhistory'));
const OrderStatus = lazy(() => import('./Componets/Product/orderstatusproduct'));
const JobPaymentSummary = lazy(() => import('./Componets/Vendor/payment_order_tech'));
const JobProgress = lazy(() => import('./Componets/Product/payment_tech_non'));
const Product = lazy(() => import('./Componets/Product/product._vendor'));
const Registration = lazy(() => import('./Componets/Login/Signup/Registration'));
const TechnicalNonDashboard = lazy(() => import('./Componets/Vendor/Technical_Non_Dashboard'));
const VendorProfileSettings = lazy(() => import('./Componets/Vendor/vendor_profile_settings'));
const LoginPage = lazy(() => import('./Componets/Login/Signup/login'));
const AddProductForm = lazy(() => import('./Componets/Product/addnewproduct'));
const BulkProductUpload = lazy(() => import('./Componets/Product/Bulkupload'));
const ProductList = lazy(() => import('./Componets/Product/viewproduct'));
const VendorCard = lazy(() => import('./Componets/Vendor/projectupload'));
const VendorProjects = lazy(() => import('./Componets/Vendor/viewprojecs'));
const Wallet = lazy(() => import('./Componets/Vendor/wallet'));
const ProdWallet = lazy(() => import('./Componets/Product/productwallet'));
const AdminApprovalPending = lazy(() => import('./Componets/Vendor/Adminapprovalpage'));
const VendorChat = lazy(() => import('./Componets/Vendor/Vendorchat'));
const VendorInbox = lazy(() => import('./Componets/Vendor/inbox'));

const LoadingFallback = () => (
  <div className="d-flex justify-content-center align-items-center vh-100">
    <div className="spinner-border text-warning" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>

            {/* PUBLIC ROUTES */}
            <Route path="/" element={<LoginPage />} />
            <Route path="/signup" element={<Registration />} />
            <Route path="/admin" element={<AdminApprovalPending />} />

            {/* Vendor Project Public Routes */}
            <Route path="/vendor/viewproject/:id" element={<VendorProjects />} />
            <Route path="/vendor/projectupload/:id" element={<VendorCard />} />
            <Route path="/user/inbox" element={<VendorInbox />} />

            {/* Product Wallet (Public or Protected? You decide) */}
            <Route path="/product/wallet/:id" element={<ProdWallet />} />

            {/* Vendor Wallet (Public or Protected?) */}
            <Route path="/vendor/wallet/:id" element={<Wallet />} />


            {/* ------------------------------- */}
            {/*        PROTECTED ROUTES         */}
            {/* ------------------------------- */}

            <Route
              path="/vendor/:id"
              element={
                <ProtectedRoute>
                  <TechnicalNonDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/vendor/:id/chat"
              element={
                <ProtectedRoute>
                  <VendorChat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/settings"
              element={
                <ProtectedRoute>
                  <VendorProfileSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/jobs"
              element={
                <ProtectedRoute>
                  <JobListings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/job/history"
              element={
                <ProtectedRoute>
                  <JobHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/job/progress"
              element={
                <ProtectedRoute>
                  <JobInProgress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/job/progress/reached"
              element={
                <ProtectedRoute>
                  <JobProgress />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/payment"
              element={
                <ProtectedRoute>
                  <OrderStatus />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/payment/success"
              element={
                <ProtectedRoute>
                  <JobPaymentSummary />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products"
              element={
                <ProtectedRoute>
                  <ProductList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products/add"
              element={
                <ProtectedRoute>
                  <AddProductForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products/bulk-upload"
              element={
                <ProtectedRoute>
                  <BulkProductUpload />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products/all"
              element={
                <ProtectedRoute>
                  <Product />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products/order"
              element={
                <ProtectedRoute>
                  <NewHistory />
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendor/:id/products/order/history"
              element={
                <ProtectedRoute>
                  <OrderHistory />
                </ProtectedRoute>
              }
            />

          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
