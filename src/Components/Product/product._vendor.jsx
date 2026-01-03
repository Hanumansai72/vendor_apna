import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import API_BASE_URL from "../../config";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";

export default function ProductDashboard() {
  const { user: authUser } = useAuth();
  const id = authUser?.id;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setcount] = useState("")

  useEffect(() => {
    const fetchcount = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/getproductcount/${id}`);
        setcount(res.data)

      }
      catch (err) {
        console.log(err)

      }
    };
    fetchcount();

  }, [id])

  // 🟡 Fetch Orders + Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/wow/${id}`),
          axios.get(`${API_BASE_URL}/viewproduct/${id}`)
        ]);

        const allOrders = ordersRes.data || {};
        setOrders(allOrders.all || []);

        const mappedProducts = productsRes.data.map((product) => ({
          id: product._id,
          name: product.ProductName,
          price: parseFloat(product.ProductPrice),
          stock: parseInt(product.quantity),
          category: product.ProductCategory,
          subcategory: product.ProductSubCategory,
          description: product.ProductDescripition,
          ProductUrl: product.ProductUrl,
          status:
            parseInt(product.ProductStock) === 0
              ? "Out of Stock"
              : parseInt(product.ProductStock) < 10
                ? "Low Stock"
                : "Available",
        }));
        setProducts(mappedProducts);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🟡 Static KPI Data
  const kpis = [
    { icon: "bi-bag-fill", title: "Total Products", value: count.count, sub: "+12 this month", subClass: "text-success" },
    { icon: "bi-coin", title: "Earnings This Month", value: count.balance, sub: "+18.2% from last month", subClass: "text-success" },
    { icon: "bi-basket2-fill", title: "Total Orders", value: count.total_order, sub: "+24 today", subClass: "text-success" },
  ];

  const categories = [
    { title: "Paints & Coatings", value: "₹18,450", trend: "+12.5%", trendClass: "text-success", icon: "🎨", bg: "var(--softBlue)" },
    { title: "Building Materials", value: "₹15,200", trend: "+8.3%", trendClass: "text-success", icon: "🧱", bg: "var(--softGray)" },
    { title: "Tools & Equipment", value: "₹8,900", trend: "−2.1%", trendClass: "text-danger", icon: "🛠️", bg: "var(--softOrange)" },
    { title: "Tiles & Flooring", value: "₹12,680", trend: "+15.7%", trendClass: "text-success", icon: "🧩", bg: "var(--softPurple)" },
  ];

  return (
    <div>
      <ProductNavbar />

      {/* Welcome */}
      <div className="container mt-4">
        <h2 className="fw-bold mb-1">
          Welcome back, Vendor <span className="wave">👋</span>
        </h2>
        <p className="text-muted fs-6">Here's your product overview and recent performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="container">
        <div className="row g-3">
          {kpis.map((k, i) => (
            <div className="col-xl-3 col-md-6" key={i}>
              <div className="card kpi-card shadow-sm border-0">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="kpi-icon">
                      <i className={`bi ${k.icon}`} />
                    </div>
                    <i className="bi bi-three-dots text-muted" />
                  </div>
                  <div className="mt-3">
                    <div className="text-muted small">{k.title}</div>
                    <div className={`display-6 fw-bold ${k.danger ? "text-danger" : "text-dark"}`}>
                      {loading ? <div className="skeleton skeleton-text w-50"></div> : k.value}
                    </div>
                    <div className={`small mt-1 ${k.subClass}`}>
                      <i className="bi bi-arrow-up-right me-1"></i>
                      {loading ? <div className="skeleton skeleton-text w-75"></div> : k.sub}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Products */}
      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="fw-bold">My Products</h4>
          <button className="btn btn-am btn-lg">
            <i className="bi bi-plus-lg me-2"></i> Add New Product
          </button>
        </div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((i) => (
              <div className="col-xl-4" key={i}>
                <div className="card product-card border-0 shadow-sm h-100 p-3">
                  <div className="skeleton skeleton-img mb-3"></div>
                  <div className="skeleton skeleton-text w-75 mb-2"></div>
                  <div className="skeleton skeleton-text w-50 mb-2"></div>
                  <div className="skeleton skeleton-text w-25"></div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center text-muted py-5">No products found.</div>
        ) : (
          <div className="row g-4">
            {products.map((p, idx) => (
              <div className="col-xl-4" key={idx}>
                <div className="card product-card border-0 shadow-sm h-100">
                  <div className="position-relative">
                    <img
                      src={p.ProductUrl?.[0] || "https://via.placeholder.com/300x200?text=No+Image"}
                      alt={p.name}
                      className="product-img"
                    />
                    <span
                      className={`badge status-badge ${p.status === "Out of Stock" ? "bg-danger" : p.status === "Low Stock" ? "bg-warning" : "bg-success"
                        }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <h5 className="fw-bold mb-1">{p.name}</h5>
                    <div className="text-muted small mb-2">{p.category}</div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="price">₹{p.price}</div>
                      <div className="small text-muted">Stock: {p.stock}</div>
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-outline-secondary flex-fill">
                        <i className="bi bi-pencil-square me-1" /> Edit
                      </button>
                      <button className="btn btn-outline-danger flex-fill">
                        <i className="bi bi-trash3-fill me-1" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="container mb-5">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="fw-bold">Recent Orders</h4>
          <a className="text-warning fw-semibold" href="#!">View All Orders</a>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            {loading ? (
              <div className="p-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton skeleton-text w-100 mb-2"></div>
                ))}
              </div>
            ) : (
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order, i) => (
                      <tr key={i}>
                        <td className="fw-semibold text-warning">{order._id?.slice(-6) || "N/A"}</td>
                        <td>{order.productName || "N/A"}</td>
                        <td>{order.customerName || order.customerId || "Unknown"}</td>
                        <td>₹{order.totalAmount || "0"}</td>
                        <td>
                          <span className={`badge bg-${getStatusBadgeColor(order.orderStatus)}`}>
                            {order.orderStatus || "Pending"}
                          </span>
                        </td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        :root {
          --amYellow: #FFD600;
          --amYellowDark: #E6C200;
          --amYellowLight: #FFF8E6;
          --softBlue: #DBEAFE;
          --softGray: #F3F4F6;
          --softOrange: #FEF3C7;
          --softPurple: #F3E8FF;
          --textPrimary: #111827;
          --textSecondary: #4B5563;
          --textMuted: #9CA3AF;
          --borderLight: #E5E7EB;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: #F9FAFB;
        }
        
        .wave { 
          animation: wave 1.2s ease-in-out infinite; 
          display: inline-block; 
          transform-origin: 70% 70%; 
        }
        @keyframes wave { 
          0% { transform: rotate(0) } 
          50% { transform: rotate(12deg) } 
          100% { transform: rotate(0) } 
        }

        /* KPI Cards */
        .kpi-card { 
          border-radius: 16px; 
          background: #fff;
          transition: all 0.3s ease;
          border: 1px solid var(--borderLight);
        }
        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          border-color: var(--amYellow);
        }
        .kpi-icon { 
          width: 52px; 
          height: 52px; 
          border-radius: 14px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: var(--amYellowLight); 
          color: var(--amYellowDark);
          font-size: 1.25rem;
        }
        
        /* Primary Button */
        .btn-am { 
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%); 
          border: none; 
          color: var(--textPrimary); 
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(255, 214, 0, 0.3);
        }
        .btn-am:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 214, 0, 0.4);
          background: linear-gradient(135deg, #E6C200 0%, #F5A400 100%);
        }
        
        /* Wallet Banner */
        .wallet-banner { 
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%); 
          color: var(--textPrimary);
          border-radius: 16px;
        }
        .wallet-icon { 
          width: 44px; 
          height: 44px; 
          border-radius: 12px; 
          background: rgba(255,255,255,0.9); 
          color: var(--textPrimary); 
          display: inline-flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 1.25rem;
        }
        .wallet-coin { 
          font-size: 72px; 
          color: rgba(255,255,255,.25);
        }
        
        /* Product Cards */
        .product-card { 
          border-radius: 16px;
          background: #fff;
          border: 1px solid var(--borderLight);
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
          border-color: var(--amYellow);
        }
        .product-img { 
          width: 100%; 
          height: 200px; 
          object-fit: cover;
        }
        .status-badge { 
          position: absolute; 
          top: 12px; 
          right: 12px; 
          padding: 0.4rem 0.75rem; 
          border-radius: 999px; 
          font-weight: 600;
          font-size: 0.75rem;
        }
        .price {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--textPrimary);
        }
        
        /* Category Cards */
        .cat-icon { 
          width: 64px; 
          height: 64px; 
          border-radius: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-size: 1.75rem; 
          margin: 0 auto;
        }
        
        /* Table Improvements */
        .table th {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--textSecondary);
          background: var(--softGray);
          padding: 1rem 1.25rem;
          border-bottom: 1px solid var(--borderLight);
        }
        .table td {
          padding: 1rem 1.25rem;
          vertical-align: middle;
          border-bottom: 1px solid #F3F4F6;
        }
        .table tbody tr {
          transition: background-color 0.15s ease;
        }
        .table tbody tr:hover {
          background-color: var(--amYellowLight);
        }
        
        /* Improved Buttons */
        .btn-outline-secondary {
          border-color: var(--borderLight);
          color: var(--textSecondary);
          border-radius: 8px;
          transition: all 0.2s ease;
        }
        .btn-outline-secondary:hover {
          background: var(--amYellowLight);
          border-color: var(--amYellow);
          color: var(--textPrimary);
        }
        .btn-outline-danger {
          border-radius: 8px;
        }

        /* 🦴 Skeleton Styles */
        .skeleton {
          background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
          border-radius: 8px;
          animation: shimmer 1.5s infinite;
          background-size: 200% 100%;
        }
        .skeleton-text { 
          height: 14px; 
          margin: 6px 0;
        }
        .skeleton-img { 
          height: 200px; 
          width: 100%; 
          border-radius: 12px;
        }
        @keyframes shimmer { 
          0% { background-position: 200% 0; } 
          100% { background-position: -200% 0; } 
        }
        
        /* Section Headers */
        h4.fw-bold {
          color: var(--textPrimary);
          font-size: 1.25rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .product-img {
            height: 180px;
          }
          .kpi-icon {
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
      <Footer></Footer>
    </div>
  );
}

// 🔸 Badge Color Helper
function getStatusBadgeColor(status) {
  switch ((status || "").toLowerCase()) {
    case "pending": return "warning";
    case "delivered": return "success";
    case "cancelled": return "danger";
    case "shipped": return "info";
    case "processing": return "secondary";
    default: return "light";
  }
}
