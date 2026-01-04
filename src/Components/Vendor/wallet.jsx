import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaArrowDown, FaArrowUp, FaWallet, FaHistory, FaExchangeAlt } from "react-icons/fa";
import { api } from "../../config";
import Footer from "../Navbar/footer";
import Navbar from "../Navbar/navbar";
import { useAuth } from "../Auth/AuthContext";
import "./Techincal.css";

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  useEffect(() => {
    async function fetchWallet() {
      if (!vendorId) return;
      try {
        const res = await api.get(`/wallet/${vendorId}`);
        setWallet(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchWallet();
  }, [vendorId]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="wallet-wrapper">
          <div className="container-xl py-5">
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading wallet...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="wallet-wrapper">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="wallet-header mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="page-title">
                <FaWallet className="me-3 text-warning" />
                My Wallet
              </h1>
              <p className="page-subtitle">Manage your earnings & transactions</p>
            </div>
            <Link to={`/vendor/${vendorId}`} className="btn-back">
              <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
            </Link>
          </motion.div>

          <div className="row g-4">
            {/* Main Content */}
            <div className="col-lg-8">
              {/* Balance Card */}
              <motion.div
                className="balance-card mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="balance-bg"></div>
                <div className="balance-content">
                  <div className="balance-info">
                    <span className="balance-label">Available Balance</span>
                    <h2 className="balance-amount">₹{wallet?.balance || 0}</h2>
                    <span className="balance-update">Last updated just now</span>
                  </div>
                  <div className="balance-actions">
                    <button className="btn-wallet-action primary">
                      <i className="bi bi-plus-lg"></i>
                      <span>Add Money</span>
                    </button>
                    <button className="btn-wallet-action secondary">
                      <i className="bi bi-arrow-up-right"></i>
                      <span>Withdraw</span>
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Transactions */}
              <motion.div
                className="card-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="section-header">
                  <div>
                    <h5 className="section-title">
                      <FaHistory className="me-2 text-muted" />
                      Transaction History
                    </h5>
                    <p className="section-subtitle">Your recent transactions</p>
                  </div>
                  <button className="btn-filter">
                    <i className="bi bi-funnel me-2"></i>Filter
                  </button>
                </div>

                <div className="transactions-list">
                  {wallet?.transactions && wallet.transactions.length > 0 ? (
                    wallet.transactions.map((txn) => (
                      <div className="transaction-item" key={txn._id}>
                        <div className={`txn-icon ${txn.type}`}>
                          {txn.type === "credit" ? <FaArrowDown /> : <FaArrowUp />}
                        </div>
                        <div className="txn-info">
                          <h6 className="txn-title">{txn.description}</h6>
                          <span className="txn-date">
                            {new Date(txn.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`txn-amount ${txn.type}`}>
                          {txn.type === "credit" ? "+" : "-"}₹{txn.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <FaExchangeAlt size={40} />
                      <p>No transactions yet</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4">
              {/* Commission Card */}
              <motion.div
                className="commission-card mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="commission-header">
                  <i className="bi bi-receipt"></i>
                  <span>Commission Due</span>
                </div>
                <h3 className="commission-amount">₹{wallet?.commissionDue || 0}</h3>
                <p className="commission-note">Platform commission for completed jobs</p>
                <button className="btn-pay-commission">
                  <i className="bi bi-credit-card me-2"></i>
                  Pay via UPI
                </button>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="wallet-stats mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h6 className="stats-title">This Month</h6>
                <div className="stat-row">
                  <span className="stat-label">
                    <i className="bi bi-arrow-down-circle text-success me-2"></i>
                    Total Earned
                  </span>
                  <span className="stat-value text-success">₹{wallet?.monthlyEarnings || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">
                    <i className="bi bi-arrow-up-circle text-danger me-2"></i>
                    Total Withdrawn
                  </span>
                  <span className="stat-value text-danger">₹{wallet?.monthlyWithdrawn || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">
                    <i className="bi bi-check-circle text-primary me-2"></i>
                    Jobs Completed
                  </span>
                  <span className="stat-value text-primary">{wallet?.jobsCompleted || 0}</span>
                </div>
              </motion.div>

              {/* Quick Links */}
              <motion.div
                className="wallet-links"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <a href="#" className="wallet-link">
                  <i className="bi bi-file-text"></i>
                  <span>Download Statement</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
                <a href="#" className="wallet-link">
                  <i className="bi bi-bank"></i>
                  <span>Bank Details</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
                <a href="#" className="wallet-link">
                  <i className="bi bi-question-circle"></i>
                  <span>Payment Help</span>
                  <i className="bi bi-chevron-right"></i>
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .wallet-wrapper {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }
        
        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }
        
        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #111827);
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        
        .page-subtitle {
          color: var(--text-muted, #9ca3af);
          font-size: 0.95rem;
          margin: 0;
        }
        
        .btn-back {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          color: var(--text-secondary, #4b5563);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .btn-back:hover {
          background: var(--primary-light, #FFF8E6);
          border-color: var(--primary, #FFD600);
          color: var(--text-primary, #111827);
        }
        
        /* Balance Card */
        .balance-card {
          position: relative;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border-radius: 20px;
          padding: 2rem;
          overflow: hidden;
        }
        
        .balance-bg {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 300px;
          height: 300px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        
        .balance-content {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        
        .balance-label {
          display: block;
          font-size: 0.9rem;
          color: rgba(0,0,0,0.6);
          margin-bottom: 0.25rem;
        }
        
        .balance-amount {
          font-size: 2.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0;
        }
        
        .balance-update {
          font-size: 0.75rem;
          color: rgba(0,0,0,0.5);
        }
        
        .balance-actions {
          display: flex;
          gap: 0.75rem;
        }
        
        .btn-wallet-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-wallet-action.primary {
          background: white;
          color: #111827;
        }
        
        .btn-wallet-action.secondary {
          background: rgba(0,0,0,0.15);
          color: #111827;
        }
        
        .btn-wallet-action:hover {
          transform: translateY(-2px);
        }
        
        .btn-wallet-action i {
          font-size: 1.1rem;
        }
        
        /* Transactions */
        .transactions-list {
          display: flex;
          flex-direction: column;
        }
        
        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        
        .transaction-item:last-child {
          border-bottom: none;
        }
        
        .txn-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        
        .txn-icon.credit {
          background: #dcfce7;
          color: #22c55e;
        }
        
        .txn-icon.debit {
          background: #fee2e2;
          color: #ef4444;
        }
        
        .txn-info {
          flex: 1;
          min-width: 0;
        }
        
        .txn-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 0.25rem;
        }
        
        .txn-date {
          font-size: 0.75rem;
          color: var(--text-muted, #9ca3af);
        }
        
        .txn-amount {
          font-size: 1rem;
          font-weight: 700;
          flex-shrink: 0;
        }
        
        .txn-amount.credit {
          color: #22c55e;
        }
        
        .txn-amount.debit {
          color: #ef4444;
        }
        
        .btn-filter {
          padding: 0.5rem 1rem;
          background: var(--bg-subtle, #f3f4f6);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-filter:hover {
          border-color: var(--primary, #FFD600);
          background: var(--primary-light, #FFF8E6);
        }
        
        /* Commission Card */
        .commission-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
        }
        
        .commission-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: var(--text-muted, #9ca3af);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }
        
        .commission-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #ef4444;
          margin: 0 0 0.25rem;
        }
        
        .commission-note {
          font-size: 0.75rem;
          color: var(--text-muted, #9ca3af);
          margin-bottom: 1rem;
        }
        
        .btn-pay-commission {
          width: 100%;
          padding: 0.75rem;
          background: var(--primary, #FFD600);
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-pay-commission:hover {
          background: #E6C200;
          transform: translateY(-1px);
        }
        
        /* Stats */
        .wallet-stats {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.25rem;
        }
        
        .stats-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted, #9ca3af);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        
        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }
        
        .stat-row:last-child {
          border-bottom: none;
        }
        
        .stat-label {
          font-size: 0.85rem;
          color: var(--text-secondary, #4b5563);
          display: flex;
          align-items: center;
        }
        
        .stat-value {
          font-weight: 700;
          font-size: 0.95rem;
        }
        
        /* Links */
        .wallet-links {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .wallet-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          color: var(--text-secondary, #4b5563);
          text-decoration: none;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
          transition: all 0.2s ease;
        }
        
        .wallet-link:last-child {
          border-bottom: none;
        }
        
        .wallet-link:hover {
          background: var(--primary-light, #FFF8E6);
          color: var(--text-primary, #111827);
        }
        
        .wallet-link span {
          flex: 1;
        }
        
        .wallet-link .bi-chevron-right {
          opacity: 0.5;
        }
        
        /* Loading */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border, #e5e7eb);
          border-top-color: var(--primary, #FFD600);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .balance-card {
            padding: 1.5rem;
          }
          
          .balance-amount {
            font-size: 2rem;
          }
          
          .balance-content {
            flex-direction: column;
            align-items: stretch;
          }
          
          .balance-actions {
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Wallet;
