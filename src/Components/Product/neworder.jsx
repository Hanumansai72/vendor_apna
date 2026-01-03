import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../../config";
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

  useEffect(() => {
    if (!vendorId) return;
    fetchOrders();
  }, [vendorId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/pending-orders/${vendorId}`);
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ ...toast, show: false }), 3000);
  };

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
      await axios.put(`${API_BASE_URL}/update-order-status/${orderId}`, {
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
      Pending: { bg: "#fef3c7", color: "#d97706" },
      Processing: { bg: "#dbeafe", color: "#2563eb" },
      Shipped: { bg: "#e0e7ff", color: "#4f46e5" },
      Delivered: { bg: "#d1fae5", color: "#059669" },
      Cancelled: { bg: "#fee2e2", color: "#dc2626" },
    };
    return colors[status] || { bg: "#f3f4f6", color: "#6b7280" };
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

      <div className="container-xl py-4">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">
              <i className="bi bi-cart-check-fill text-primary me-3"></i>
              Manage Orders
            </h1>
            <p className="page-subtitle">Track and update your product orders</p>
          </div>
          <button className="btn-refresh" onClick={fetchOrders}>
            <i className="bi bi-arrow-clockwise me-2"></i>
            Refresh
          </button>
        </motion.div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Orders", value: stats.total, icon: "bi-receipt", color: "#3b82f6" },
            { label: "Pending", value: stats.pending, icon: "bi-clock", color: "#f59e0b" },
            { label: "Processing", value: stats.processing, icon: "bi-arrow-repeat", color: "#8b5cf6" },
            { label: "Delivered", value: stats.delivered, icon: "bi-check-circle", color: "#10b981" },
          ].map((stat, i) => (
            <div className="col-6 col-lg-3" key={i}>
              <motion.div
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                  <i className={`bi ${stat.icon}`}></i>
                </div>
                <div className="stat-info">
                  <span className="stat-value">{loading ? "-" : stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="status-tabs">
            {statuses.map(status => (
              <button
                key={status}
                className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
                {status !== "All" && (
                  <span className="tab-count">
                    {orders.filter(o => status === "All" || o.orderStatus === status).length}
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
          </div>
        </div>

        {/* Orders Table */}
        <div className="orders-card">
          {loading ? (
            <div className="orders-loading">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>No orders found</p>
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
                          <span className="product-name">{order.productName || "Product"}</span>
                        </td>
                        <td>{order.customerName || "Customer"}</td>
                        <td>{order.quantity || 1}</td>
                        <td className="order-total">₹{order.totalPrice || order.totalAmount || 0}</td>
                        <td className="order-date">
                          {new Date(order.orderedAt || order.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              background: getStatusColor(order.orderStatus).bg,
                              color: getStatusColor(order.orderStatus).color
                            }}
                          >
                            {order.orderStatus || "Pending"}
                          </span>
                        </td>
                        <td>
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
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            className={`toast-notification ${toast.type}`}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}`}></i>
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .orders-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .page-header {
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

        .btn-refresh {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-refresh:hover {
          background: #f1f5f9;
          border-color: #cbd5e1;
        }

        /* Stat Cards */
        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* Filters */
        .filters-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .status-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-tab {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-tab:hover {
          border-color: #3b82f6;
          color: #3b82f6;
        }

        .status-tab.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .tab-count {
          background: rgba(255,255,255,0.2);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          margin-left: 0.5rem;
          font-size: 0.75rem;
        }

        .search-box {
          position: relative;
        }

        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-box input {
          padding: 0.625rem 1rem 0.625rem 2.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          width: 280px;
          font-size: 0.9rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* Orders Card */
        .orders-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
        }

        .orders-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
          color: #334155;
        }

        .orders-table tr:hover {
          background: #f8fafc;
        }

        .order-id {
          font-weight: 600;
          color: #3b82f6;
        }

        .product-name {
          font-weight: 500;
          color: #1e293b;
        }

        .order-total {
          font-weight: 600;
          color: #1e293b;
        }

        .order-date {
          color: #64748b;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-select {
          padding: 0.375rem 0.75rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          font-size: 0.85rem;
          background: white;
          cursor: pointer;
        }

        .status-select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        /* Empty & Loading */
        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
        }

        .empty-state i {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .orders-loading {
          padding: 1rem;
        }

        .skeleton-row {
          height: 60px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Toast */
        .toast-notification {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .toast-notification.success {
          background: #d1fae5;
          color: #059669;
        }

        .toast-notification.error {
          background: #fee2e2;
          color: #dc2626;
        }

        @media (max-width: 768px) {
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box input {
            width: 100%;
          }

          .status-tabs {
            overflow-x: auto;
            padding-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default NewOrders;
