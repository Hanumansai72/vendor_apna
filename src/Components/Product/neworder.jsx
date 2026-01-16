import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const NewOrders = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const showToast = useCallback((message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type });
    }, 3000);
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/pending-orders/${vendorId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [vendorId, showToast]);

  useEffect(() => {
    if (!vendorId) return;
    fetchOrders();
  }, [vendorId, fetchOrders]);



  useEffect(() => {
    let result = orders;

    if (statusFilter !== "All") {
      result = result.filter(o => o.orderStatus === statusFilter);
    }

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        o.customerName?.toLowerCase().includes(q) ||
        o.productName?.toLowerCase().includes(q) ||
        o._id?.toLowerCase().includes(q)
      );
    }

    setFiltered(result);
  }, [orders, search, statusFilter]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/update-order-status/${orderId}`, {
        orderStatus: newStatus,
      });
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, orderStatus: newStatus } : o
      ));
      showToast(`Order updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Error updating order:", err);
      showToast("Failed to update order", "error");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Pending: { bg: "#FEF3C7", color: "#92400E", icon: "bi-clock" },
      Processing: { bg: "#DBEAFE", color: "#1E40AF", icon: "bi-arrow-repeat" },
      Shipped: { bg: "#E0E7FF", color: "#4338CA", icon: "bi-truck" },
      Delivered: { bg: "#DCFCE7", color: "#166534", icon: "bi-check-circle" },
      Cancelled: { bg: "#FEE2E2", color: "#991B1B", icon: "bi-x-circle" },
    };
    return colors[status] || { bg: "#f3f4f6", color: "#6b7280", icon: "bi-question-circle" };
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.orderStatus === "Pending").length,
    processing: orders.filter(o => o.orderStatus === "Processing").length,
    delivered: orders.filter(o => o.orderStatus === "Delivered").length,
  };

  return (
    <div className="orders-page">
      <ProductNavbar />

      <div className="orders-container">
        {/* Header */}
        <motion.div
          className="page-header-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-cart-check-fill"></i>
            </div>
            <div className="header-text">
              <h1 className="page-title">Manage Orders</h1>
              <p className="page-subtitle">Track and update your product orders</p>
            </div>
          </div>
          <button className="btn-refresh" onClick={fetchOrders}>
            <i className="bi bi-arrow-clockwise"></i>
            <span>Refresh</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            { label: "Total Orders", value: stats.total, icon: "bi-receipt", gradient: "linear-gradient(135deg, #FFD600 0%, #FFC107 100%)" },
            { label: "Pending", value: stats.pending, icon: "bi-clock", gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" },
            { label: "Processing", value: stats.processing, icon: "bi-arrow-repeat", gradient: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)" },
            { label: "Delivered", value: stats.delivered, icon: "bi-check-circle", gradient: "linear-gradient(135deg, #22C55E 0%, #16A34A 100%)" },
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
                <span className="stat-value">{loading ? "-" : stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          className="filters-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="status-tabs">
            {statuses.map(status => (
              <button
                key={status}
                className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status !== "All" && (
                  <span className="tab-dot" style={{ background: getStatusColor(status).color }}></span>
                )}
                {status}
                {status !== "All" && (
                  <span className="tab-count">
                    {orders.filter(o => o.orderStatus === status).length}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch("")}>
                <i className="bi bi-x"></i>
              </button>
            )}
          </div>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          className="orders-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="orders-loading">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h4>No orders found</h4>
              <p>There are no orders matching your criteria</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.map((order, i) => (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <td>
                          <span className="order-id">#{order._id?.slice(-6)}</span>
                        </td>
                        <td>
                          <div className="product-cell">
                            <span className="product-name">{order.productName || "Product"}</span>
                          </div>
                        </td>
                        <td>
                          <div className="customer-cell">
                            <div className="customer-avatar">
                              {(order.customerName || "C")[0].toUpperCase()}
                            </div>
                            <span>{order.customerName || "Customer"}</span>
                          </div>
                        </td>
                        <td>
                          <span className="qty-badge">{order.quantity || 1}</span>
                        </td>
                        <td className="order-total">₹{order.totalPrice || order.totalAmount || 0}</td>
                        <td className="order-date">
                          {new Date(order.orderedAt || order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: getStatusColor(order.orderStatus).bg,
                              color: getStatusColor(order.orderStatus).color
                            }}
                          >
                            <i className={`bi ${getStatusColor(order.orderStatus).icon}`}></i>
                            {order.orderStatus || "Pending"}
                          </span>
                        </td>
                        <td>
                          <div className="action-wrapper">
                            <select
                              className="status-select"
                              value={order.orderStatus || "Pending"}
                              onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                            <i className="bi bi-chevron-down select-arrow"></i>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Results Count */}
        {!loading && filtered.length > 0 && (
          <div className="results-info">
            Showing <strong>{filtered.length}</strong> of <strong>{orders.length}</strong> orders
          </div>
        )}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
          >
            <div className="toast-icon">
              <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-circle-fill'}`}></i>
            </div>
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        /* =============================================
           Orders Page - Yellow & White Theme
           ============================================= */
        
        .orders-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFBEB 0%, #FEF9C3 50%, #FFFFFF 100%);
        }

        .orders-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Page Header */
        .page-header-card {
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

        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0;
          font-size: 0.95rem;
        }

        .btn-refresh {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          border-color: #FFD600;
          background: #FFFBEB;
          color: #1a1a1a;
        }

        .btn-refresh i {
          font-size: 1.125rem;
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
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: #FDE68A;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.375rem;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Filters Card */
        .filters-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .status-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-tab {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: #f9fafb;
          border: 2px solid transparent;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-tab:hover {
          background: #FFFBEB;
          border-color: #FDE68A;
          color: #1a1a1a;
        }

        .status-tab.active {
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-color: transparent;
          color: #1a1a1a;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .tab-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-tab.active .tab-dot {
          background: #1a1a1a !important;
        }

        .tab-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.125rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .status-tab.active .tab-count {
          background: rgba(0, 0, 0, 0.15);
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-box > i {
          position: absolute;
          left: 14px;
          color: #9ca3af;
          font-size: 1rem;
        }

        .search-box input {
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          width: 280px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .search-box input:focus {
          outline: none;
          border-color: #FFD600;
          box-shadow: 0 0 0 4px rgba(255, 214, 0, 0.15);
        }

        .search-clear {
          position: absolute;
          right: 10px;
          width: 24px;
          height: 24px;
          background: #f3f4f6;
          border: none;
          border-radius: 6px;
          color: #6b7280;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-clear:hover {
          background: #e5e7eb;
        }

        /* Orders Card */
        .orders-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          background: #FEFCE8;
          padding: 1rem 1.25rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #92400E;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #FDE68A;
        }

        .orders-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9rem;
          color: #374151;
          vertical-align: middle;
        }

        .orders-table tr:hover {
          background: #FFFBEB;
        }

        .order-id {
          font-weight: 700;
          color: #D4A200;
          background: #FEF3C7;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .product-cell {
          display: flex;
          flex-direction: column;
        }

        .product-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .customer-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.8rem;
          color: #1a1a1a;
        }

        .qty-badge {
          background: #f3f4f6;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-weight: 600;
          color: #374151;
        }

        .order-total {
          font-weight: 700;
          color: #1a1a1a;
          font-size: 0.95rem;
        }

        .order-date {
          color: #6b7280;
          font-size: 0.85rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge i {
          font-size: 0.7rem;
        }

        .action-wrapper {
          position: relative;
        }

        .status-select {
          padding: 0.5rem 2rem 0.5rem 0.875rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          background: #ffffff;
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
          min-width: 130px;
        }

        .status-select:focus {
          outline: none;
          border-color: #FFD600;
          box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.15);
        }

        .action-wrapper .select-arrow {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.7rem;
          color: #9ca3af;
          pointer-events: none;
        }

        /* Empty & Loading */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: #FEF3C7;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .empty-icon i {
          font-size: 2rem;
          color: #D4A200;
        }

        .empty-state h4 {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        .orders-loading {
          padding: 1.5rem;
        }

        .skeleton-row {
          height: 64px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Results Info */
        .results-info {
          text-align: center;
          padding: 1rem;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .results-info strong {
          color: #1a1a1a;
        }

        /* Toast */
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 600;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
        }

        .toast-notification.success {
          background: #DCFCE7;
          color: #166534;
          border: 1px solid #86EFAC;
        }

        .toast-notification.error {
          background: #FEE2E2;
          color: #991B1B;
          border: 1px solid #FECACA;
        }

        .toast-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.125rem;
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 992px) {
          .page-header-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-refresh {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .orders-container {
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

          .filters-card {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box input {
            width: 100%;
          }

          .status-tabs {
            overflow-x: auto;
            padding-bottom: 0.5rem;
            flex-wrap: nowrap;
          }

          .status-tab {
            white-space: nowrap;
          }

          .orders-table th,
          .orders-table td {
            padding: 0.75rem;
            font-size: 0.8rem;
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
};

export default NewOrders;
