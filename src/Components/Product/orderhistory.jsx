import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../../config";
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
      const res = await axios.get(`${API_BASE_URL}/wow/${vendorId}`);
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
      Delivered: { bg: "#d1fae5", color: "#059669" },
      Processing: { bg: "#dbeafe", color: "#2563eb" },
      Pending: { bg: "#fef3c7", color: "#d97706" },
      Shipped: { bg: "#e0e7ff", color: "#4f46e5" },
      Cancelled: { bg: "#fee2e2", color: "#dc2626" },
    };
    return styles[status] || { bg: "#f3f4f6", color: "#6b7280" };
  };

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.orderStatus === "Delivered").length,
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
          <div>
            <h1 className="page-title">
              <i className="bi bi-clock-history text-primary me-3"></i>
              Order History
            </h1>
            <p className="page-subtitle">View all past orders and transactions</p>
          </div>
          <div className="header-actions">
            <button className="btn-action" onClick={fetchOrders}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Refresh
            </button>
            <button className="btn-action">
              <i className="bi bi-download me-2"></i>
              Export
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="row g-3 mb-4">
          {[
            { label: "Total Orders", value: stats.total, icon: "bi-receipt", color: "#3b82f6" },
            { label: "Delivered", value: stats.delivered, icon: "bi-check-circle", color: "#10b981" },
            { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, icon: "bi-currency-rupee", color: "#f59e0b" },
          ].map((stat, i) => (
            <div className="col-md-4" key={i}>
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
          <div className="filter-group">
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
            <div className="loading-state">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="skeleton-row"></div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="bi bi-inbox"></i>
              <p>No orders found</p>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
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
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <td>
                            <span className="order-id">#{order._id?.slice(-6)}</span>
                          </td>
                          <td>
                            <div className="product-cell">
                              <img
                                src={order.productImage || "https://via.placeholder.com/40"}
                                alt=""
                                className="product-thumb"
                              />
                              <span className="product-name">{order.productName || "Product"}</span>
                            </div>
                          </td>
                          <td>
                            <div className="customer-cell">
                              <img
                                src={`https://ui-avatars.com/api/?name=${order.customerName}&background=3b82f6&color=fff&size=32`}
                                alt=""
                                className="customer-avatar"
                              />
                              <span>{order.customerName || "Customer"}</span>
                            </div>
                          </td>
                          <td className="date-cell">
                            {new Date(order.orderedAt || order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="amount-cell">
                            ₹{(order.totalPrice || order.totalAmount || 0).toLocaleString()}
                          </td>
                          <td>
                            <span
                              className="status-badge"
                              style={{
                                background: getStatusStyle(order.orderStatus).bg,
                                color: getStatusStyle(order.orderStatus).color
                              }}
                            >
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
                <div className="pagination-bar">
                  <span className="pagination-info">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length}
                  </span>
                  <div className="pagination-controls">
                    <button
                      className="page-btn"
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
                      className="page-btn"
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
        </div>
      </div>

      <Footer />

      <style>{`
        .order-history-page {
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

        .header-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action:hover {
          background: #f1f5f9;
        }

        /* Stats */
        .stat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .stat-label {
          font-size: 0.85rem;
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

        .filter-select {
          padding: 0.625rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          font-size: 0.9rem;
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
          border-bottom: 1px solid #e2e8f0;
        }

        .orders-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
        }

        .orders-table tr:hover {
          background: #f8fafc;
        }

        .order-id {
          font-weight: 600;
          color: #3b82f6;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .product-thumb {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }

        .product-name {
          font-weight: 500;
          color: #1e293b;
        }

        .customer-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .customer-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
        }

        .date-cell {
          color: #64748b;
        }

        .amount-cell {
          font-weight: 600;
          color: #1e293b;
        }

        .status-badge {
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* Pagination */
        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: #64748b;
        }

        .pagination-controls {
          display: flex;
          gap: 0.25rem;
        }

        .page-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .page-btn:hover:not(:disabled) {
          background: #f1f5f9;
        }

        .page-btn.active {
          background: #3b82f6;
          border-color: #3b82f6;
          color: white;
        }

        .page-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        .loading-state {
          padding: 1rem;
        }

        .skeleton-row {
          height: 60px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .filters-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box input {
            width: 100%;
          }

          .pagination-bar {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderHistory;
