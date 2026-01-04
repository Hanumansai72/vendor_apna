import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const ProdWallet = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!vendorId) return;

    const fetchWallet = async () => {
      try {
        const res = await api.get(`/product-wallet/${vendorId}`);
        setWallet(res.data);
      } catch (err) {
        console.error("Wallet fetch error:", err);
        setWallet({
          balance: 0,
          commissionDue: 0,
          transactions: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, [vendorId]);

  const filteredTransactions = wallet?.transactions?.filter(txn => {
    if (activeTab === "all") return true;
    return txn.type === activeTab;
  }) || [];

  return (
    <div className="wallet-page">
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
              <i className="bi bi-wallet2"></i>
            </div>
            <div>
              <h1 className="page-title">Product Wallet</h1>
              <p className="page-subtitle">Manage your product earnings and payments</p>
            </div>
          </div>
          <Link to={`/vendor/${vendorId}/products/all`} className="btn-back">
            <i className="bi bi-arrow-left"></i>
            <span>Back to Dashboard</span>
          </Link>
        </motion.div>

        <div className="row g-4">
          {/* Balance Card */}
          <div className="col-lg-8">
            <motion.div
              className="balance-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="balance-header">
                <div className="balance-label-section">
                  <i className="bi bi-wallet-fill"></i>
                  <span className="balance-label">Available Balance</span>
                </div>
                <div className="balance-actions">
                  <button className="btn-wallet-action">
                    <i className="bi bi-plus-lg"></i>
                    <span>Add Money</span>
                  </button>
                  <button className="btn-wallet-action secondary">
                    <i className="bi bi-arrow-up"></i>
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
              <div className="balance-amount">
                {loading ? (
                  <div className="skeleton-text large"></div>
                ) : (
                  <>₹{wallet?.balance?.toLocaleString() || 0}</>
                )}
              </div>
              <div className="balance-stats">
                <div className="balance-stat income">
                  <div className="stat-icon-circle">
                    <i className="bi bi-arrow-down-short"></i>
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">+₹12,450</span>
                    <span className="stat-label">Income This Month</span>
                  </div>
                </div>
                <div className="balance-stat expense">
                  <div className="stat-icon-circle">
                    <i className="bi bi-arrow-up-short"></i>
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">-₹3,200</span>
                    <span className="stat-label">Withdrawals</span>
                  </div>
                </div>
                <div className="balance-stat pending">
                  <div className="stat-icon-circle">
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                  <div className="stat-details">
                    <span className="stat-value">₹5,800</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Transactions */}
            <motion.div
              className="transactions-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="section-header">
                <div className="section-title">
                  <i className="bi bi-clock-history"></i>
                  <h5>Recent Transactions</h5>
                </div>
                <div className="transaction-tabs">
                  {[
                    { key: "all", label: "All" },
                    { key: "credit", label: "Income" },
                    { key: "debit", label: "Expenses" }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="transactions-loading">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-transaction"></div>
                  ))}
                </div>
              ) : !filteredTransactions.length ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <i className="bi bi-receipt"></i>
                  </div>
                  <h4>No Transactions Yet</h4>
                  <p>Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="transactions-list">
                  <AnimatePresence>
                    {filteredTransactions.map((txn, i) => (
                      <motion.div
                        className="transaction-item"
                        key={txn._id || i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <div className={`txn-icon ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                          <i className={`bi ${txn.type === 'credit' ? 'bi-arrow-down-left' : 'bi-arrow-up-right'}`}></i>
                        </div>
                        <div className="txn-info">
                          <span className="txn-desc">{txn.description || "Transaction"}</span>
                          <span className="txn-meta">
                            <i className="bi bi-calendar3"></i>
                            {new Date(txn.date || txn.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className={`txn-amount ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                          {txn.type === 'credit' ? '+' : '-'}₹{txn.amount?.toLocaleString()}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <button className="btn-view-all">
                View All Transactions
                <i className="bi bi-arrow-right"></i>
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Commission Card */}
            <motion.div
              className="commission-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="commission-header">
                <div className="commission-icon">
                  <i className="bi bi-percent"></i>
                </div>
                <span>Commission Due</span>
              </div>
              <div className="commission-amount">
                {loading ? (
                  <div className="skeleton-text"></div>
                ) : (
                  <>₹{wallet?.commissionDue?.toLocaleString() || 0}</>
                )}
              </div>
              <p className="commission-note">Platform fee for this month</p>
              <div className="commission-progress">
                <div className="progress-bar" style={{ width: '65%' }}></div>
              </div>
              <p className="commission-due-date">
                <i className="bi bi-calendar-event"></i>
                Due by 15th of this month
              </p>
              <button className="btn-pay-commission">
                <i className="bi bi-credit-card"></i>
                Pay via UPI
              </button>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              className="quick-links-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="quick-links-header">
                <i className="bi bi-grid"></i>
                <h6>Quick Actions</h6>
              </div>
              <div className="quick-links">
                <Link to={`/vendor/${vendorId}/products/order`} className="quick-link">
                  <div className="quick-link-icon">
                    <i className="bi bi-cart3"></i>
                  </div>
                  <span>View Orders</span>
                </Link>
                <Link to={`/vendor/${vendorId}/products`} className="quick-link">
                  <div className="quick-link-icon">
                    <i className="bi bi-box-seam"></i>
                  </div>
                  <span>My Products</span>
                </Link>
                <Link to={`/vendor/${vendorId}`} className="quick-link">
                  <div className="quick-link-icon">
                    <i className="bi bi-tools"></i>
                  </div>
                  <span>Services</span>
                </Link>
                <a href="#" className="quick-link">
                  <div className="quick-link-icon">
                    <i className="bi bi-question-circle"></i>
                  </div>
                  <span>Help Center</span>
                </a>
              </div>
            </motion.div>

            {/* Payment Methods */}
            <motion.div
              className="payment-methods-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className="payment-header">
                <i className="bi bi-credit-card-2-front"></i>
                <h6>Payment Methods</h6>
              </div>
              <div className="payment-list">
                <div className="payment-item">
                  <div className="payment-icon upi">
                    <i className="bi bi-phone"></i>
                  </div>
                  <div className="payment-details">
                    <span className="payment-name">UPI</span>
                    <span className="payment-info">vendor@upi</span>
                  </div>
                  <span className="payment-badge primary">Primary</span>
                </div>
                <div className="payment-item">
                  <div className="payment-icon bank">
                    <i className="bi bi-bank"></i>
                  </div>
                  <div className="payment-details">
                    <span className="payment-name">Bank Account</span>
                    <span className="payment-info">****4567</span>
                  </div>
                </div>
              </div>
              <button className="btn-add-payment">
                <i className="bi bi-plus-circle"></i>
                Add Payment Method
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .wallet-page {
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

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          font-weight: 600;
          color: #92400e;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .btn-back:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
          color: #78350f;
        }

        /* Balance Card */
        .balance-card {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%);
          border-radius: 24px;
          padding: 2rem;
          color: white;
          margin-bottom: 1.5rem;
          box-shadow: 0 15px 50px rgba(251, 191, 36, 0.35);
          position: relative;
          overflow: hidden;
        }

        .balance-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          position: relative;
          z-index: 1;
        }

        .balance-label-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .balance-label-section i {
          font-size: 1.25rem;
        }

        .balance-label {
          font-size: 1rem;
          opacity: 0.95;
          font-weight: 500;
        }

        .balance-actions {
          display: flex;
          gap: 0.75rem;
        }

        .btn-wallet-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 10px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .btn-wallet-action:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-2px);
        }

        .btn-wallet-action.secondary {
          background: white;
          color: #d97706;
          border-color: white;
        }

        .btn-wallet-action.secondary:hover {
          background: #fef9c3;
        }

        .balance-amount {
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          position: relative;
          z-index: 1;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .balance-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          position: relative;
          z-index: 1;
        }

        .balance-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 14px;
          backdrop-filter: blur(10px);
        }

        .stat-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .balance-stat.income .stat-icon-circle {
          background: rgba(16, 185, 129, 0.3);
        }

        .balance-stat.expense .stat-icon-circle {
          background: rgba(239, 68, 68, 0.3);
        }

        .balance-stat.pending .stat-icon-circle {
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-details {
          display: flex;
          flex-direction: column;
        }

        .stat-details .stat-value {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .stat-details .stat-label {
          font-size: 0.75rem;
          opacity: 0.85;
        }

        /* Transactions Card */
        .transactions-card {
          background: white;
          border: 1px solid #fef3c7;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .section-title i {
          font-size: 1.25rem;
          color: #d97706;
        }

        .section-title h5 {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
        }

        .transaction-tabs {
          display: flex;
          gap: 0.5rem;
          background: #fef9c3;
          padding: 0.375rem;
          border-radius: 10px;
        }

        .tab-btn {
          padding: 0.5rem 1rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #92400e;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          background: rgba(251, 191, 36, 0.3);
        }

        .tab-btn.active {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          box-shadow: 0 2px 10px rgba(251, 191, 36, 0.35);
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-height: 350px;
          overflow-y: auto;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: linear-gradient(135deg, #fffbeb 0%, white 100%);
          border: 1px solid #fef3c7;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .transaction-item:hover {
          border-color: #fbbf24;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.15);
        }

        .txn-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .txn-icon.credit {
          background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
          color: #047857;
        }

        .txn-icon.debit {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          color: #dc2626;
        }

        .txn-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .txn-desc {
          font-weight: 600;
          color: #1f2937;
        }

        .txn-meta {
          font-size: 0.8rem;
          color: #6b7280;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .txn-meta i {
          font-size: 0.75rem;
        }

        .txn-amount {
          font-size: 1.1rem;
          font-weight: 700;
        }

        .txn-amount.credit {
          color: #047857;
        }

        .txn-amount.debit {
          color: #dc2626;
        }

        .btn-view-all {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem;
          margin-top: 1rem;
          background: #fef9c3;
          border: 2px solid #fde68a;
          border-radius: 12px;
          color: #92400e;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-view-all:hover {
          background: #fde68a;
          transform: translateY(-2px);
        }

        /* Commission Card */
        .commission-card {
          background: white;
          border: 1px solid #fef3c7;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .commission-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .commission-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dc2626;
          font-size: 1rem;
        }

        .commission-header span {
          color: #6b7280;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .commission-amount {
          font-size: 2.25rem;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 0.25rem;
        }

        .commission-note {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-bottom: 1rem;
        }

        .commission-progress {
          height: 8px;
          background: #fee2e2;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
          border-radius: 10px;
        }

        .commission-due-date {
          font-size: 0.8rem;
          color: #6b7280;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }

        .commission-due-date i {
          color: #f59e0b;
        }

        .btn-pay-commission {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.35);
        }

        .btn-pay-commission:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(251, 191, 36, 0.45);
        }

        /* Quick Links Card */
        .quick-links-card {
          background: white;
          border: 1px solid #fef3c7;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .quick-links-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .quick-links-header i {
          color: #d97706;
          font-size: 1.25rem;
        }

        .quick-links-header h6 {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
        }

        .quick-links {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .quick-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.625rem;
          padding: 1.25rem 1rem;
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border: 2px solid #fde68a;
          border-radius: 14px;
          text-decoration: none;
          color: #92400e;
          transition: all 0.3s ease;
        }

        .quick-link:hover {
          background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(251, 191, 36, 0.2);
          color: #78350f;
        }

        .quick-link-icon {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.25rem;
        }

        .quick-link span {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
        }

        /* Payment Methods Card */
        .payment-methods-card {
          background: white;
          border: 1px solid #fef3c7;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
        }

        .payment-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
        }

        .payment-header i {
          color: #d97706;
          font-size: 1.25rem;
        }

        .payment-header h6 {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
        }

        .payment-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .payment-item {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 1rem;
          background: #fffbeb;
          border: 1px solid #fef3c7;
          border-radius: 12px;
        }

        .payment-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .payment-icon.upi {
          background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
          color: #4f46e5;
        }

        .payment-icon.bank {
          background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
          color: #d97706;
        }

        .payment-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .payment-name {
          font-weight: 600;
          color: #1f2937;
        }

        .payment-info {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .payment-badge {
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .payment-badge.primary {
          background: #d1fae5;
          color: #047857;
        }

        .btn-add-payment {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          background: white;
          border: 2px dashed #fde68a;
          border-radius: 12px;
          color: #92400e;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-add-payment:hover {
          background: #fef9c3;
          border-style: solid;
        }

        /* Empty & Loading */
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .empty-icon i {
          font-size: 2rem;
          color: #d97706;
        }

        .empty-state h4 {
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        .skeleton-text {
          height: 1.5rem;
          width: 120px;
          background: linear-gradient(90deg, #fef9c3 25%, #fde68a 50%, #fef9c3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 6px;
        }

        .skeleton-text.large {
          height: 3.5rem;
          width: 200px;
        }

        .skeleton-transaction {
          height: 70px;
          background: linear-gradient(90deg, #fef9c3 25%, #fde68a 50%, #fef9c3 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 14px;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 992px) {
          .balance-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }

          .header-content {
            flex-direction: column;
          }

          .balance-amount {
            font-size: 2.5rem;
          }

          .balance-actions {
            flex-direction: column;
            width: 100%;
          }

          .btn-wallet-action {
            width: 100%;
            justify-content: center;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
          }

          .transaction-tabs {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ProdWallet;
