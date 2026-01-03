import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import API_BASE_URL from "../../config";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";

export default function ProductDashboard() {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ count: 0, balance: 0, total_order: 0 });

  useEffect(() => {
    if (!vendorId) return;

    const fetchData = async () => {
      try {
        const [countRes, ordersRes, productsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/getproductcount/${vendorId}`),
          axios.get(`${API_BASE_URL}/wow/${vendorId}`),
          axios.get(`${API_BASE_URL}/viewproduct/${vendorId}`)
        ]);

        setStats(countRes.data || {});
        setOrders((ordersRes.data?.all || []).slice(0, 5));
        setProducts((productsRes.data || []).slice(0, 6).map(p => ({
          id: p._id,
          name: p.ProductName,
          price: parseFloat(p.ProductPrice) || 0,
          stock: parseInt(p.ProductStock) || 0,
          category: p.ProductCategory,
          image: Array.isArray(p.ProductUrl) ? p.ProductUrl[0] : p.ProductUrl,
          status: parseInt(p.ProductStock) === 0 ? "Out of Stock" :
            parseInt(p.ProductStock) < 10 ? "Low Stock" : "In Stock"
        })));
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [vendorId]);

  const getStatusColor = (status) => {
    if (status === "Delivered" || status === "Completed") return "success";
    if (status === "Pending") return "warning";
    if (status === "Cancelled") return "danger";
    return "secondary";
  };

  return (
    <div className="product-dashboard">
      <ProductNavbar />

      <div className="dashboard-content">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="dashboard-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="page-title">
                <i className="bi bi-box-seam-fill text-primary me-3"></i>
                Product Dashboard
              </h1>
              <p className="page-subtitle">Manage your products and track orders</p>
            </div>
            <Link to={`/vendor/${vendorId}/products/add`} className="btn-add-product">
              <i className="bi bi-plus-lg me-2"></i>
              Add Product
            </Link>
          </motion.div>

          {/* Stats Cards */}
          <div className="row g-4 mb-4">
            {[
              { icon: "bi-box-seam", label: "Total Products", value: stats.count || 0, color: "#3b82f6", bg: "#dbeafe" },
              { icon: "bi-cart-check", label: "Total Orders", value: stats.total_order || 0, color: "#10b981", bg: "#d1fae5" },
              { icon: "bi-currency-rupee", label: "Total Earnings", value: `₹${stats.balance || 0}`, color: "#f59e0b", bg: "#fef3c7" },
              { icon: "bi-graph-up-arrow", label: "This Month", value: "+24.5%", color: "#8b5cf6", bg: "#ede9fe" },
            ].map((stat, i) => (
              <div className="col-6 col-lg-3" key={i}>
                <motion.div
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ '--stat-color': stat.color, '--stat-bg': stat.bg }}
                >
                  <div className="stat-icon">
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">{stat.label}</span>
                    <span className="stat-value">
                      {loading ? <div className="skeleton-text"></div> : stat.value}
                    </span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>

          <div className="row g-4">
            {/* Products Grid */}
            <div className="col-lg-8">
              <div className="section-card">
                <div className="section-header">
                  <h5><i className="bi bi-grid-fill me-2"></i>Recent Products</h5>
                  <Link to={`/vendor/${vendorId}/products`} className="view-all">View All</Link>
                </div>

                {loading ? (
                  <div className="row g-3">
                    {[1, 2, 3].map(i => (
                      <div className="col-md-4" key={i}>
                        <div className="product-card skeleton-card"></div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-box-seam"></i>
                    <p>No products yet</p>
                    <Link to={`/vendor/${vendorId}/products/add`} className="btn btn-primary btn-sm">Add Product</Link>
                  </div>
                ) : (
                  <div className="row g-3">
                    {products.map((p, i) => (
                      <div className="col-md-4" key={p.id}>
                        <motion.div
                          className="product-card"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <div className="product-image">
                            <img src={p.image || "https://via.placeholder.com/200"} alt={p.name} />
                            <span className={`stock-badge ${p.status === 'In Stock' ? 'in-stock' : p.status === 'Low Stock' ? 'low-stock' : 'out-stock'}`}>
                              {p.status}
                            </span>
                          </div>
                          <div className="product-info">
                            <span className="product-category">{p.category}</span>
                            <h6 className="product-name">{p.name}</h6>
                            <div className="product-meta">
                              <span className="product-price">₹{p.price}</span>
                              <span className="product-stock">{p.stock} units</span>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="col-lg-4">
              <div className="section-card">
                <div className="section-header">
                  <h5><i className="bi bi-receipt me-2"></i>Recent Orders</h5>
                  <Link to={`/vendor/${vendorId}/products/order`} className="view-all">View All</Link>
                </div>

                {loading ? (
                  <div className="orders-list">
                    {[1, 2, 3].map(i => (
                      <div className="order-item skeleton-order" key={i}></div>
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="empty-state">
                    <i className="bi bi-cart-x"></i>
                    <p>No orders yet</p>
                  </div>
                ) : (
                  <div className="orders-list">
                    {orders.map((order, i) => (
                      <motion.div
                        className="order-item"
                        key={order._id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className="order-info">
                          <span className="order-id">#{order._id?.slice(-6)}</span>
                          <span className="order-product">{order.productName || "Product"}</span>
                          <span className="order-customer">{order.customerName || "Customer"}</span>
                        </div>
                        <div className="order-meta">
                          <span className="order-amount">₹{order.totalAmount || 0}</span>
                          <span className={`order-status status-${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus || "Pending"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="section-card mt-4">
                <div className="section-header">
                  <h5><i className="bi bi-lightning-fill me-2"></i>Quick Actions</h5>
                </div>
                <div className="quick-actions">
                  <Link to={`/vendor/${vendorId}/products/add`} className="quick-action">
                    <i className="bi bi-plus-circle"></i>
                    <span>Add Product</span>
                  </Link>
                  <Link to={`/vendor/${vendorId}/products/bulk-upload`} className="quick-action">
                    <i className="bi bi-cloud-upload"></i>
                    <span>Bulk Upload</span>
                  </Link>
                  <Link to={`/product/wallet/${vendorId}`} className="quick-action">
                    <i className="bi bi-wallet2"></i>
                    <span>Wallet</span>
                  </Link>
                  <Link to={`/vendor/${vendorId}`} className="quick-action">
                    <i className="bi bi-tools"></i>
                    <span>Services</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .product-dashboard {
          min-height: 100vh;
          background: #f8fafc;
        }

        .dashboard-content {
          padding-top: 1rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          margin: 0.25rem 0 0;
        }

        .btn-add-product {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border-radius: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-add-product:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          color: white;
        }

        /* Stat Cards */
        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          border-color: var(--stat-color);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: var(--stat-bg);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--stat-color);
          font-size: 1.25rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        /* Section Cards */
        .section-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.25rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h5 {
          margin: 0;
          font-weight: 600;
          color: #1e293b;
        }

        .view-all {
          font-size: 0.85rem;
          color: #3b82f6;
          text-decoration: none;
          font-weight: 500;
        }

        /* Product Cards */
        .product-card {
          background: #f8fafc;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .product-image {
          position: relative;
          height: 120px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .stock-badge.in-stock { background: #d1fae5; color: #059669; }
        .stock-badge.low-stock { background: #fef3c7; color: #d97706; }
        .stock-badge.out-stock { background: #fee2e2; color: #dc2626; }

        .product-info {
          padding: 0.75rem;
        }

        .product-category {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .product-name {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0.25rem 0;
          color: #1e293b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-price {
          font-weight: 700;
          color: #3b82f6;
        }

        .product-stock {
          font-size: 0.75rem;
          color: #64748b;
        }

        /* Orders List */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .order-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 10px;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .order-id {
          font-weight: 600;
          color: #3b82f6;
          font-size: 0.8rem;
        }

        .order-product {
          font-size: 0.85rem;
          color: #1e293b;
        }

        .order-customer {
          font-size: 0.75rem;
          color: #64748b;
        }

        .order-meta {
          text-align: right;
        }

        .order-amount {
          display: block;
          font-weight: 600;
          color: #1e293b;
        }

        .order-status {
          font-size: 0.7rem;
          padding: 0.125rem 0.5rem;
          border-radius: 4px;
        }

        .status-success { background: #d1fae5; color: #059669; }
        .status-warning { background: #fef3c7; color: #d97706; }
        .status-danger { background: #fee2e2; color: #dc2626; }
        .status-secondary { background: #e2e8f0; color: #64748b; }

        /* Quick Actions */
        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          text-decoration: none;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .quick-action:hover {
          background: #dbeafe;
          color: #3b82f6;
        }

        .quick-action i {
          font-size: 1.25rem;
        }

        .quick-action span {
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        .empty-state i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        /* Skeletons */
        .skeleton-card {
          height: 200px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
        }

        .skeleton-order {
          height: 60px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 10px;
        }

        .skeleton-text {
          height: 1.25rem;
          width: 60%;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
          }

          .btn-add-product {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
