import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import ProductNavbar from "./productnav";

export default function ProductDashboard() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const id = localStorage.getItem("vendorId");
  const[count,setcount]=useState("")

  useEffect(()=>{
    const fetchcount=async()=>{
      try{
       const res = await axios.get(`https://backend-d6mx.vercel.app/api/getproductcount/${id}`);
       setcount(res.data.count)

      }
      catch(err){
        console.log(err)

      }
    };
    fetchcount();
    
  },[id])

  // 🟡 Fetch Orders + Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          axios.get(`https://backend-d6mx.vercel.app/wow/${id}`),
          axios.get(`https://backend-d6mx.vercel.app/viewproduct/${id}`)
        ]);

        const allOrders = ordersRes.data || {};
        setOrders(allOrders.all || []);

        const mappedProducts = productsRes.data.map((product) => ({
          id: product._id,
          name: product.ProductName,
          price: parseFloat(product.totalPrice),
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
    { icon: "bi-bag-fill", title: "Total Products", value:count.count, sub: "+12 this month", subClass: "text-success" },
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
                      className={`badge status-badge ${
                        p.status === "Out of Stock" ? "bg-danger" : p.status === "Low Stock" ? "bg-warning" : "bg-success"
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
          --amYellow: #FFC107;
          --softBlue: #e8f0ff;
          --softGray: #eef2f6;
          --softOrange: #fff1e5;
          --softPurple: #f3e9ff;
        }
        .wave { animation: wave 1.2s ease-in-out infinite; display: inline-block; transform-origin: 70% 70%; }
        @keyframes wave { 0% { transform: rotate(0) } 50% { transform: rotate(12deg) } 100% { transform: rotate(0) } }

        .kpi-card { border-radius: 16px; }
        .kpi-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: rgba(255,193,7,.2); color: #f5a400; }
        .btn-am { background: var(--amYellow); border: none; color: #111; font-weight: 700; }
        .wallet-banner { background: var(--amYellow); color: #111; }
        .wallet-icon { width: 40px; height: 40px; border-radius: 12px; background: #fff3cd; color: #111; display: inline-flex; align-items: center; justify-content: center; font-size: 1.25rem; }
        .wallet-coin { font-size: 72px; color: rgba(255,255,255,.35); }
        .product-card { border-radius: 18px; }
        .product-img { width: 100%; height: 220px; object-fit: cover; border-top-left-radius: 18px; border-top-right-radius: 18px; }
        .status-badge { position: absolute; top: 14px; right: 14px; padding: .45rem .7rem; border-radius: 999px; font-weight: 600; }
        .cat-icon { width: 68px; height: 68px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto; }

        /* 🦴 Skeleton Styles */
        .skeleton {
          background: linear-gradient(90deg, #f2f2f2 25%, #e8e8e8 37%, #f2f2f2 63%);
          border-radius: 8px;
          animation: shimmer 1.6s infinite;
          background-size: 400% 100%;
        }
        .skeleton-text { height: 14px; margin-top: 6px; margin-bottom: 6px; }
        .skeleton-img { height: 180px; width: 100%; border-radius: 12px; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      `}</style>
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
