import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import JobListings from './Componets/Vendor/accpet';
import JobHistory from './Componets/Vendor/jobhistory';
import NewHistory from './Componets/Product/neworder';
import JobInProgress from './Componets/Vendor/next_accpet';
import OrderHistory from './Componets/Product/orderhistory';
import OrderStatus from './Componets/Product/orderstatusproduct';
import JobPaymentSummary from './Componets/Vendor/payment_order_tech';
import JobProgress from './Componets/Product/payment_tech_non';
import Product from './Componets/Product/product._vendor';
import Registration from './Componets/Login/Signup/Registration';
import TechnicalNonDashboard from './Componets/Vendor/Technical_Non_Dashboard';
import VendorProfileSettings from './Componets/Vendor/vendor_profile_settings';
import LoginPage from './Componets/Login/Signup/login';
import AddProductForm from './Componets/Product/addnewproduct';
import BulkProductUpload from './Componets/Product/Bulkupload';
import ProductList from './Componets/Product/viewproduct';
import ProtectedRoute from './Componets/Login/Signup/ProtectedRoute';
import VendorCard from './Componets/Vendor/projectupload';
import VendorProjects from './Componets/Vendor/viewprojecs';
import Wallet from './Componets/Vendor/wallet';
import ProdWallet from './Componets/Product/productwallet';
import AdminApprovalPending from './Componets/Vendor/Adminapprovalpage';
import VendorChat from './Componets/Vendor/Vendorchat';

function App() {
  return (
    <Router>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<Registration />} />
        <Route path="/admin" element={<AdminApprovalPending />} />

        {/* Vendor Project Public Routes */}
        <Route path="/vendor/viewproject/:id" element={<VendorProjects />} />
        <Route path="/vendor/projectupload/:id" element={<VendorCard />} />

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
    </Router>
  );
}

export default App;
