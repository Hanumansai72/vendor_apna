import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import JobListings from './Componets/Vendor/accpet';
import JobHistory from './Componets/Vendor/jobhistory';
import NewHistory from './Componets/Vendor/neworder';
import JobInProgress from './Componets/Vendor/next_accpet';
import OrderHistory from './Componets/Vendor/orderhistory';
import OrderStatus from './Componets/Vendor/orderstatusproduct';
import JobPaymentSummary from './Componets/Vendor/payment_order_tech';
import JobProgress from './Componets/Vendor/payment_tech_non';
import Product from './Componets/Vendor/product._vendor';
import Registration from './Componets/Vendor/Registration';
import TechnicalNonDashboard from './Componets/Vendor/Technical_Non_Dashboard';
import VendorProfileSettings from './Componets/Vendor/vendor_profile_settings';
import LoginPage from './Componets/login';
import AddProductForm from './Componets/Vendor/addnewproduct';
import BulkProductUpload from './Componets/Vendor/Bulkupload';
import ProductList from './Componets/Vendor/viewproduct';
import ProtectedRoute from './Componets/Vendor/ProtectedRoute';

const Protected = ({ element }) => (
  <ProtectedRoute>
    {element}
  </ProtectedRoute>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Registration />} />

        {/* Protected Routes */}
        <Route path="/vendor/:id/" element={<Protected element={<TechnicalNonDashboard />} />} />
        <Route path=":id/settings" element={<Protected element={<VendorProfileSettings />} />} />
        <Route path="/vendor/:id/Jobs" element={<Protected element={<JobListings />} />} />
        <Route path="/vendor/:id/Job/history" element={<Protected element={<JobHistory />} />} />
        <Route path="/vendor/:id/Job/Progress" element={<Protected element={<JobInProgress />} />} />
        <Route path="/vendor/:id/Job/Progress/reached" element={<Protected element={<JobProgress />} />} />
        <Route path="/vendor/:id/Payment" element={<Protected element={<OrderStatus />} />} />
        <Route path="/vendor/:id/Payment/success" element={<Protected element={<JobPaymentSummary />} />} />
        <Route path="/product/:id/ViewProduct" element={<Protected element={<ProductList />} />} />
        <Route path="/addproduct/:id" element={<Protected element={<AddProductForm />} />} />
        <Route path="/addproduct/:id/BulkUpload" element={<Protected element={<BulkProductUpload />} />} />
        <Route path="/Product/:id" element={<Protected element={<Product />} />} />
        <Route path="/Product/:id/order" element={<Protected element={<NewHistory />} />} />
        <Route path="/Product/:id/order/history" element={<Protected element={<OrderHistory />} />} />
      </Routes>
    </Router>
  );
}

export default App;
