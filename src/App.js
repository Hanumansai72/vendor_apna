import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Components/Auth/AuthContext';
import ProtectedRoute from './Components/Login/Signup/ProtectedRoute';

// Lazy load components
const JobListings = lazy(() => import('./Components/Vendor/accpet'));
const JobHistory = lazy(() => import('./Components/Vendor/jobhistory'));
const NewHistory = lazy(() => import('./Components/Product/neworder'));
const JobInProgress = lazy(() => import('./Components/Vendor/next_accpet'));
const OrderHistory = lazy(() => import('./Components/Product/orderhistory'));
const OrderStatus = lazy(() => import('./Components/Product/orderstatusproduct'));
const JobPaymentSummary = lazy(() => import('./Components/Vendor/payment_order_tech'));
const JobProgress = lazy(() => import('./Components/Product/payment_tech_non'));
const Product = lazy(() => import('./Components/Product/product._vendor'));
const Registration = lazy(() => import('./Components/Login/Signup/Registration'));
const TechnicalNonDashboard = lazy(() => import('./Components/Vendor/Technical_Non_Dashboard'));
const VendorProfileSettings = lazy(() => import('./Components/Vendor/vendor_profile_settings'));
const LoginPage = lazy(() => import('./Components/Login/Signup/login'));
const AddProductForm = lazy(() => import('./Components/Product/addnewproduct'));
const BulkProductUpload = lazy(() => import('./Components/Product/Bulkupload'));
const ProductList = lazy(() => import('./Components/Product/viewproduct'));
const VendorCard = lazy(() => import('./Components/Vendor/projectupload'));
const VendorProjects = lazy(() => import('./Components/Vendor/viewprojecs'));
const Wallet = lazy(() => import('./Components/Vendor/wallet'));
const ProdWallet = lazy(() => import('./Components/Product/productwallet'));
const AdminApprovalPending = lazy(() => import('./Components/Vendor/Adminapprovalpage'));
const VendorChat = lazy(() => import('./Components/Vendor/Vendorchat'));
const VendorInbox = lazy(() => import('./Components/Vendor/inbox'));

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
             <Route path="/product/:id/ViewProduct" element={<Protected element={<ProductList />} />} />
        <Route path="/addproduct/:id" element={<Protected element={<AddProductForm />} />} />
        <Route path="/addproduct/:id/BulkUpload" element={<Protected element={<BulkProductUpload />} />} />
        <Route path="/Product/:id" element={<Protected element={<Product />} />} />
        <Route path="/Product/:id/order" element={<Protected element={<NewHistory />} />} />
        <Route path="/Product/:id/order/history" element={<Protected element={<OrderHistory />} />} />
                <Route path='/product/wallet/:id' element={<ProdWallet></ProdWallet>} />


          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
