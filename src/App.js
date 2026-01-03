import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


import JobListings from './Components/Vendor/accpet';
import JobHistory from './Components/Vendor/jobhistory';
import NewHistory from './Components/Product/neworder';
import JobInProgress from './Components/Vendor/next_accpet';
import OrderHistory from './Components/Product/orderhistory';
import OrderStatus from './Components/Product/orderstatusproduct';
import JobPaymentSummary from './Components/Vendor/payment_order_tech';
import JobProgress from './Components/Product/payment_tech_non';
import Product from './Components/Product/product._vendor';
import Registration from './Components/Login/Signup/Registration';
import TechnicalNonDashboard from './Components/Vendor/Technical_Non_Dashboard';
import VendorProfileSettings from './Components/Vendor/vendor_profile_settings';
import LoginPage from './Components/Login/Signup/login';
import AddProductForm from './Components/Product/addnewproduct';
import BulkProductUpload from './Components/Product/Bulkupload';
import ProductList from './Components/Product/viewproduct';
import ProtectedRoute from './Components/Login/Signup/ProtectedRoute';
import VendorCard from './Components/Vendor/projectupload';
import VendorProjects from './Components/Vendor/viewprojecs';
import Wallet from './Components/Vendor/wallet';
import ProdWallet from './Components/Product/productwallet';

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
        <Route path="/" element={<LoginPage />} />
        <Route path='/wallet/:id' element={<Wallet></Wallet>} />
        <Route path="/signup" element={<Registration />} />
        <Route path='/vendor/Viewproject/:id' element={<VendorProjects></VendorProjects>} />

        <Route path='/vendor/projectupload/:id' element={<VendorCard></VendorCard>} />
        <Route path='/product/wallet/:id' element={<ProdWallet></ProdWallet>} />


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