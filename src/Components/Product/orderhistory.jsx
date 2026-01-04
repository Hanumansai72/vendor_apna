import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const OrderHistory = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!vendorId) return;
    fetchOrders();
  }, [vendorId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wow/${vendorId}`);
      const data = res.data?.all || [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
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
    setCurrentPage(1);
  }, [orders, search, statusFilter]);

  const getStatusStyle = (status) => {
    const styles = {
      Delivered: { bg: "#d1fae5", color: "#059669", icon: "bi-check-circle-fill" },
      Processing: { bg: "#fef9c3", color: "#ca8a04", icon: "bi-arrow-repeat" },
      Pending: { bg: "#fff7ed", color: "#ea580c", icon: "bi-clock-fill" },
      Shipped: { bg: "#dbeafe", color: "#2563eb", icon: "bi-truck" },
      Cancelled: { bg: "#fee2e2", color: "#dc2626", icon: "bi-x-circle-fill" },
    };
    return styles[status] || { bg: "#f3f4f6", color: "#6b7280", icon: "bi-question-circle" };
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.orderStatus === "Delivered").length,
    pending: orders.filter(o => o.orderStatus === "Pending").length,
    revenue: orders.reduce((sum, o) => sum + (o.totalPrice || o.totalAmount || 0), 0),
  };

  return (
    <div className="order-history-page">
      <ProductNavbar />

      <div className="container-xl py-4">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-clock-history"></i>
            </div>
            <div>
              <h1 className="page-title">Order History</h1>
              <p className="page-subtitle">View and manage all your past orders and transactions</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-action btn-refresh" onClick={fetchOrders}>
              <i className="bi bi-arrow-clockwise"></i>
              <span>Refresh</span>
            </button>
            <button className="btn-action btn-export">
              <i className="bi bi-download"></i>
              <span>Export</span>
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            { label: "Total Orders", value: stats.total, icon: "bi-box-seam", gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)" },
            { label: "Delivered", value: stats.delivered, icon: "bi-check-circle", gradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)" },
            { label: "Pending", value: stats.pending, icon: "bi-hourglass-split", gradient: "linear-gradient(135deg, #fb923c 0%, #ea580c 100%)" },
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "bi-currency-rupee", gradient: "linear-gradient(135deg, #fbbf24 0%, #d97706 100%)" },
          ].map((stat, i) => (
            <motion.div
              className="stat-card"
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="stat-icon-wrapper" style={{ background: stat.gradient }}>
                <i className={`bi ${stat.icon}`}></i>
              </div>
              <div className="stat-content">
                <span className="stat-value">{loading ? "—" : stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <motion.div
          className="filters-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="filter-tabs">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                className={`filter-tab ${statusFilter === status ? 'active' : ''}`}
                onClick={() => setStatusFilter(status)}
              >
                {status}
                {status === "All" && <span className="tab-count">{orders.length}</span>}
              </button>
            ))}
          </div>
          <div className="search-wrapper">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search by order ID, product or customer..."
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
          className="orders-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {loading ? (
            <div className="loading-state">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-cell skeleton-id"></div>
                  <div className="skeleton-cell skeleton-product"></div>
                  <div className="skeleton-cell skeleton-customer"></div>
                  <div className="skeleton-cell skeleton-date"></div>
                  <div className="skeleton-cell skeleton-amount"></div>
                  <div className="skeleton-cell skeleton-status"></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h3>No Orders Found</h3>
              <p>There are no orders matching your current filters.</p>
              <button className="btn-reset" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence>
                      {paginated.map((order, i) => (
                        <motion.tr
                          key={order._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          transition={{ delay: i * 0.03 }}
                          className="order-row"
                        >
                          <td>
                            <span className="order-id">#{order._id?.slice(-6)}</span>
                          </td>
                          <td>
                            <div className="product-info">
                              <img
                                src={order.productImage || "https://via.placeholder.com/50"}
                                alt=""
                                className="product-image"
                              />
                              <span className="product-name">{order.productName || "Product"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="customer-info">
                              <div className="customer-avatar">
                                {(order.customerName || "C")[0].toUpperCase()}
                              </div>
                              <span className="customer-name">{order.customerName || "Customer"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="date-info">
                              <span className="date-day">{new Date(order.orderedAt || order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                              <span className="date-year">{new Date(order.orderedAt || order.createdAt).getFullYear()}</span>
                            </div>
                          </td>
                          <td>
                            <span className="amount">₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}</span>
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                background: getStatusStyle(order.orderStatus).bg,
                                color: getStatusStyle(order.orderStatus).color
                              }}
                            >
                              <i className={`bi ${getStatusStyle(order.orderStatus).icon}`}></i>
                              {order.orderStatus || "Pending"}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination-section">
                  <span className="pagination-info">
                    Showing <strong>{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filtered.length)}</strong> of <strong>{filtered.length}</strong> orders
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-btn nav-btn"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i;
                        if (pageNum > totalPages) pageNum = totalPages - 4 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      className="page-btn nav-btn"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .order-history-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%);
          font-family: 'Inter', sans-serif;
        }

        /* Header */
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          backdrop-filter: blur(10px);
        }

        .page-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .page-subtitle {
          color: rgba(255, 255, 255, 0.9);
          margin: 0.25rem 0 0;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          color: #92400e;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
        }

        .btn-action i {
          font-size: 1.1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 576px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #fef3c7;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(251, 191, 36, 0.15);
        }

        .stat-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-wrapper i {
          font-size: 1.5rem;
          color: white;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1f2937;
          line-height: 1.2;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        /* Filters */
        .filters-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding: 1rem 1.5rem;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          border: 1px solid #fef3c7;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .filter-tab {
          padding: 0.625rem 1rem;
          background: #fef9c3;
          border: 1px solid #fcd34d;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #92400e;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-tab:hover {
          background: #fde68a;
        }

        .filter-tab.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.35);
        }

        .tab-count {
          background: rgba(255, 255, 255, 0.3);
          padding: 0.125rem 0.5rem;
          border-radius: 20px;
          font-size: 0.75rem;
        }

        .search-wrapper {
          position: relative;
          min-width: 320px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 1rem;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 2.75rem;
          border: 2px solid #fde68a;
          border-radius: 12px;
          font-size: 0.9rem;
          background: #fffbeb;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #fbbf24;
          background: white;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-clear {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: #fbbf24;
          border: none;
          border-radius: 50%;
          width: 22px;
          height: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: white;
          font-size: 1rem;
        }

        /* Orders Container */
        .orders-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.06);
          border: 1px solid #fef3c7;
          overflow: hidden;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        .orders-table {
          width: 100%;
          border-collapse: collapse;
        }

        .orders-table th {
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          padding: 1rem 1.25rem;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #fde68a;
        }

        .orders-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #fef3c7;
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .order-row {
          transition: all 0.2s ease;
        }

        .order-row:hover {
          background: linear-gradient(90deg, #fffbeb 0%, transparent 100%);
        }

        .order-id {
          font-weight: 700;
          color: #d97706;
          background: #fef9c3;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .product-info {
          display: flex;
          align-items: center;
          gap: 0.875rem;
        }

        .product-image {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          object-fit: cover;
          border: 2px solid #fde68a;
        }

        .product-name {
          font-weight: 600;
          color: #1f2937;
        }

        .customer-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .customer-avatar {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .customer-name {
          font-weight: 500;
          color: #374151;
        }

        .date-info {
          display: flex;
          flex-direction: column;
        }

        .date-day {
          font-weight: 600;
          color: #1f2937;
        }

        .date-year {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .amount {
          font-weight: 700;
          color: #047857;
          font-size: 1rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-badge i {
          font-size: 0.75rem;
        }

        /* Pagination */
        .pagination-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-top: 2px solid #fef3c7;
          background: #fffbeb;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .pagination-info strong {
          color: #92400e;
          font-weight: 600;
        }

        .pagination-controls {
          display: flex;
          gap: 0.375rem;
        }

        .page-btn {
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fde68a;
          background: white;
          border-radius: 10px;
          color: #92400e;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: #fef9c3;
          border-color: #fbbf24;
        }

        .page-btn.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .nav-btn {
          background: #fef9c3;
        }

        /* Empty & Loading States */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }

        .empty-icon i {
          font-size: 2.5rem;
          color: #d97706;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0 0 1.5rem;
        }

        .btn-reset {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-reset:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.35);
        }

        .loading-state {
          padding: 1rem 1.5rem;
        }

        .skeleton-row {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #fef3c7;
        }

        .skeleton-cell {
          height: 20px;
          background: linear-gradient(90deg, #fef9c3 25%, #fde68a 50%, #fef9c3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-id { width: 80px; }
        .skeleton-product { width: 180px; }
        .skeleton-customer { width: 140px; }
        .skeleton-date { width: 100px; }
        .skeleton-amount { width: 90px; }
        .skeleton-status { width: 100px; }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            padding: 1.25rem;
          }

          .header-content {
            flex-direction: column;
          }

          .header-actions {
            justify-content: center;
          }

          .filters-section {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-tabs {
            justify-content: center;
          }

          .search-wrapper {
            min-width: 100%;
          }

          .pagination-section {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
