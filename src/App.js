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
        <Route path='/wallet/:id' element={<Wallet></Wallet>}/>
        <Route path="/signup" element={<Registration />} />
                <Route path='/vendor/Viewproject/:id' element={<VendorProjects></VendorProjects>}/>

        <Route path='/vendor/projectupload/:id' element={<VendorCard></VendorCard>}/>
        <Route path='/product/wallet/:id' element={<ProdWallet></ProdWallet>}/>
        

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