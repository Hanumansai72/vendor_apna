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
    if (status === "Delivered" || status === "Completed") return { bg: "#DCFCE7", color: "#166534" };
    if (status === "Pending") return { bg: "#FEF3C7", color: "#92400E" };
    if (status === "Cancelled") return { bg: "#FEE2E2", color: "#991B1B" };
    if (status === "Processing") return { bg: "#DBEAFE", color: "#1E40AF" };
    return { bg: "#f3f4f6", color: "#6b7280" };
  };

  return (
    <div className="product-dashboard-page">
      <ProductNavbar />

      <div className="dashboard-container">
        {/* Header */}
        <motion.div
          className="dashboard-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-speedometer2"></i>
            </div>
            <div className="header-text">
              <h1>Product Dashboard</h1>
              <p>Manage your products and track orders</p>
            </div>
          </div>
          <Link to={`/vendor/${vendorId}/products/add`} className="btn-add-product">
            <i className="bi bi-plus-lg"></i>
            <span>Add Product</span>
          </Link>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            { icon: "bi-box-seam-fill", label: "Total Products", value: stats.count || 0, gradient: "linear-gradient(135deg, #FFD600 0%, #FFC107 100%)" },
            { icon: "bi-cart-check-fill", label: "Total Orders", value: stats.total_order || 0, gradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" },
            { icon: "bi-currency-rupee", label: "Total Earnings", value: `₹${stats.balance || 0}`, gradient: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" },
            { icon: "bi-graph-up-arrow", label: "This Month", value: "+24.5%", gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" },
          ].map((stat, i) => (
            <motion.div
              className="stat-card"
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="stat-icon" style={{ background: stat.gradient }}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">
                  {loading ? <div className="skeleton-value"></div> : stat.value}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="row g-4">
          {/* Products Grid */}
          <div className="col-lg-8">
            <motion.div
              className="section-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="section-header">
                <div className="section-title">
                  <i className="bi bi-grid-fill"></i>
                  <h4>Recent Products</h4>
                </div>
                <Link to={`/vendor/${vendorId}/products`} className="view-all-link">
                  View All
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {loading ? (
                <div className="products-grid">
                  {[1, 2, 3].map(i => (
                    <div className="product-card skeleton" key={i}></div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <h5>No products yet</h5>
                  <p>Start adding products to your store</p>
                  <Link to={`/vendor/${vendorId}/products/add`} className="btn-add-empty">
                    <i className="bi bi-plus-lg"></i>
                    Add Product
                  </Link>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map((p, i) => (
                    <motion.div
                      className="product-card"
                      key={p.id}
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
                      <div className="product-details">
                        <span className="product-category">{p.category}</span>
                        <h6 className="product-name">{p.name}</h6>
                        <div className="product-footer">
                          <span className="product-price">₹{p.price}</span>
                          <span className="product-stock">{p.stock} units</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Recent Orders */}
            <motion.div
              className="section-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="section-header">
                <div className="section-title">
                  <i className="bi bi-receipt"></i>
                  <h4>Recent Orders</h4>
                </div>
                <Link to={`/vendor/${vendorId}/products/order`} className="view-all-link">
                  View All
                  <i className="bi bi-arrow-right"></i>
                </Link>
              </div>

              {loading ? (
                <div className="orders-list">
                  {[1, 2, 3].map(i => (
                    <div className="order-item skeleton" key={i}></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-state small">
                  <div className="empty-icon small">
                    <i className="bi bi-cart-x"></i>
                  </div>
                  <h6>No orders yet</h6>
                  <p>Orders will appear here</p>
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
                      <div className="order-left">
                        <span className="order-id">#{order._id?.slice(-6)}</span>
                        <span className="order-product">{order.productName || "Product"}</span>
                        <span className="order-customer">{order.customerName || "Customer"}</span>
                      </div>
                      <div className="order-right">
                        <span className="order-amount">₹{order.totalAmount || 0}</span>
                        <span
                          className="order-status"
                          style={{
                            background: getStatusColor(order.orderStatus).bg,
                            color: getStatusColor(order.orderStatus).color
                          }}
                        >
                          {order.orderStatus || "Pending"}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              className="section-card quick-actions-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="section-header">
                <div className="section-title">
                  <i className="bi bi-lightning-charge-fill"></i>
                  <h4>Quick Actions</h4>
                </div>
              </div>
              <div className="quick-actions-grid">
                <Link to={`/vendor/${vendorId}/products/add`} className="quick-action-item">
                  <div className="action-icon add">
                    <i className="bi bi-plus-circle-fill"></i>
                  </div>
                  <span>Add Product</span>
                </Link>
                <Link to={`/vendor/${vendorId}/products/bulk-upload`} className="quick-action-item">
                  <div className="action-icon upload">
                    <i className="bi bi-cloud-arrow-up-fill"></i>
                  </div>
                  <span>Bulk Upload</span>
                </Link>
                <Link to={`/product/wallet/${vendorId}`} className="quick-action-item">
                  <div className="action-icon wallet">
                    <i className="bi bi-wallet2"></i>
                  </div>
                  <span>Wallet</span>
                </Link>
                <Link to={`/vendor/${vendorId}`} className="quick-action-item">
                  <div className="action-icon services">
                    <i className="bi bi-tools"></i>
                  </div>
                  <span>Services</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        /* =============================================
           Product Dashboard - Yellow & White Theme
           ============================================= */
        
        .product-dashboard-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFBEB 0%, #FEF9C3 50%, #FFFFFF 100%);
        }

        .dashboard-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Header */
        .dashboard-header {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #FDE68A;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.35);
        }

        .header-icon i {
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .header-text h1 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        .header-text p {
          margin: 0.25rem 0 0;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .btn-add-product {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.75rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          color: #1a1a1a;
          border-radius: 14px;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(255, 214, 0, 0.35);
        }

        .btn-add-product:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(255, 214, 0, 0.45);
          color: #1a1a1a;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
          border-color: #FDE68A;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .skeleton-value {
          width: 60px;
          height: 24px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        /* Section Cards */
        .section-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.25rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .section-title i {
          color: #D4A200;
          font-size: 1.125rem;
        }

        .section-title h4 {
          margin: 0;
          font-weight: 700;
          color: #1a1a1a;
          font-size: 1.1rem;
        }

        .view-all-link {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          color: #D4A200;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .view-all-link:hover {
          color: #92400E;
        }

        .view-all-link i {
          font-size: 0.75rem;
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .product-card {
          background: #FEFCE8;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
          border: 1px solid #FDE68A;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(255, 214, 0, 0.15);
        }

        .product-card.skeleton {
          height: 220px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .product-image {
          position: relative;
          height: 130px;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .stock-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 0.25rem 0.625rem;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 700;
          backdrop-filter: blur(8px);
        }

        .stock-badge.in-stock { background: rgba(220, 252, 231, 0.9); color: #166534; }
        .stock-badge.low-stock { background: rgba(254, 243, 199, 0.9); color: #92400E; }
        .stock-badge.out-stock { background: rgba(254, 226, 226, 0.9); color: #991B1B; }

        .product-details {
          padding: 1rem;
        }

        .product-category {
          font-size: 0.7rem;
          color: #92400E;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.05em;
        }

        .product-name {
          font-size: 0.9rem;
          font-weight: 700;
          margin: 0.375rem 0;
          color: #1a1a1a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .product-price {
          font-weight: 800;
          color: #D4A200;
          font-size: 1rem;
        }

        .product-stock {
          font-size: 0.75rem;
          color: #6b7280;
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
          padding: 1rem;
          background: #FEFCE8;
          border-radius: 14px;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .order-item:hover {
          border-color: #FDE68A;
          transform: translateX(4px);
        }

        .order-item.skeleton {
          height: 72px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .order-left {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .order-id {
          font-weight: 700;
          color: #D4A200;
          font-size: 0.85rem;
        }

        .order-product {
          font-size: 0.875rem;
          color: #1a1a1a;
          font-weight: 600;
        }

        .order-customer {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .order-right {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .order-amount {
          font-weight: 700;
          color: #1a1a1a;
          font-size: 0.95rem;
        }

        .order-status {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
        }

        /* Quick Actions */
        .quick-actions-card {
          margin-top: 1rem;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-action-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          padding: 1.25rem 1rem;
          background: #FEFCE8;
          border-radius: 14px;
          text-decoration: none;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .quick-action-item:hover {
          background: #FEF3C7;
          border-color: #FDE68A;
          transform: translateY(-2px);
        }

        .action-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
          color: #ffffff;
        }

        .action-icon.add { background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%); color: #1a1a1a; }
        .action-icon.upload { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); }
        .action-icon.wallet { background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%); }
        .action-icon.services { background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); }

        .quick-action-item span {
          font-size: 0.8rem;
          font-weight: 600;
          color: #374151;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-state.small {
          padding: 2rem 1rem;
        }

        .empty-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .empty-icon.small {
          width: 56px;
          height: 56px;
          border-radius: 16px;
        }

        .empty-icon i {
          font-size: 2rem;
          color: #D4A200;
        }

        .empty-icon.small i {
          font-size: 1.5rem;
        }

        .empty-state h5,
        .empty-state h6 {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .btn-add-empty {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 12px;
          font-weight: 600;
          color: #1a1a1a;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .btn-add-empty:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
          color: #1a1a1a;
        }

        /* Animations */
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-product {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .stat-card {
            padding: 1rem;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
            font-size: 1.125rem;
          }

          .stat-value {
            font-size: 1.25rem;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
