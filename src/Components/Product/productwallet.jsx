import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../../config";
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

  useEffect(() => {
    if (!vendorId) return;

    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/product-wallet/${vendorId}`);
        setWallet(res.data);
      } catch (err) {
        console.error("Wallet fetch error:", err);
        // Set default wallet on error
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
          <div>
            <h1 className="page-title">
              <i className="bi bi-wallet2 text-primary me-3"></i>
              Product Wallet
            </h1>
            <p className="page-subtitle">Manage your product earnings and payments</p>
          </div>
          <Link to={`/vendor/${vendorId}/products/all`} className="btn-back">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
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
                <span className="balance-label">Available Balance</span>
                <div className="balance-actions">
                  <button className="btn-wallet-action">
                    <i className="bi bi-plus-lg"></i>
                    Add Money
                  </button>
                  <button className="btn-wallet-action secondary">
                    <i className="bi bi-arrow-up"></i>
                    Withdraw
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
                <div className="balance-stat">
                  <i className="bi bi-arrow-down-circle text-success"></i>
                  <div>
                    <span className="stat-value text-success">+₹12,450</span>
                    <span className="stat-label">This Month</span>
                  </div>
                </div>
                <div className="balance-stat">
                  <i className="bi bi-arrow-up-circle text-danger"></i>
                  <div>
                    <span className="stat-value text-danger">-₹3,200</span>
                    <span className="stat-label">Withdrawals</span>
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
                <h5><i className="bi bi-clock-history me-2"></i>Recent Transactions</h5>
                <button className="btn-text">View All</button>
              </div>

              {loading ? (
                <div className="transactions-loading">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton-transaction"></div>
                  ))}
                </div>
              ) : !wallet?.transactions?.length ? (
                <div className="empty-state">
                  <i className="bi bi-receipt"></i>
                  <p>No transactions yet</p>
                </div>
              ) : (
                <div className="transactions-list">
                  {wallet.transactions.map((txn, i) => (
                    <motion.div
                      className="transaction-item"
                      key={txn._id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className={`txn-icon ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                        <i className={`bi ${txn.type === 'credit' ? 'bi-arrow-down' : 'bi-arrow-up'}`}></i>
                      </div>
                      <div className="txn-info">
                        <span className="txn-desc">{txn.description || "Transaction"}</span>
                        <span className="txn-date">
                          {new Date(txn.date || txn.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={`txn-amount ${txn.type === 'credit' ? 'credit' : 'debit'}`}>
                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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
                <i className="bi bi-percent"></i>
                <span>Commission Due</span>
              </div>
              <div className="commission-amount">
                {loading ? (
                  <div className="skeleton-text"></div>
                ) : (
                  <>₹{wallet?.commissionDue || 0}</>
                )}
              </div>
              <p className="commission-note">Platform fee for this month</p>
              <button className="btn-pay-commission">
                <i className="bi bi-credit-card me-2"></i>
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
              <h6><i className="bi bi-grid me-2"></i>Quick Actions</h6>
              <div className="quick-links">
                <Link to={`/vendor/${vendorId}/products/order`} className="quick-link">
                  <i className="bi bi-cart"></i>
                  <span>View Orders</span>
                </Link>
                <Link to={`/vendor/${vendorId}/products`} className="quick-link">
                  <i className="bi bi-box-seam"></i>
                  <span>My Products</span>
                </Link>
                <Link to={`/vendor/${vendorId}`} className="quick-link">
                  <i className="bi bi-tools"></i>
                  <span>Services</span>
                </Link>
                <a href="#" className="quick-link">
                  <i className="bi bi-question-circle"></i>
                  <span>Help</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .wallet-page {
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

        .btn-back {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        /* Balance Card */
        .balance-card {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 20px;
          padding: 2rem;
          color: white;
          margin-bottom: 1.5rem;
        }

        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .balance-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .balance-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-wallet-action {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.2);
          border: none;
          border-radius: 8px;
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-wallet-action:hover {
          background: rgba(255,255,255,0.3);
        }

        .btn-wallet-action.secondary {
          background: white;
          color: #1d4ed8;
        }

        .balance-amount {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .balance-stats {
          display: flex;
          gap: 2rem;
        }

        .balance-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .balance-stat i {
          font-size: 1.25rem;
          background: rgba(255,255,255,0.2);
          padding: 0.5rem;
          border-radius: 8px;
        }

        .balance-stat .stat-value {
          display: block;
          font-weight: 600;
        }

        .balance-stat .stat-label {
          display: block;
          font-size: 0.75rem;
          opacity: 0.8;
        }

        /* Transactions Card */
        .transactions-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
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

        .btn-text {
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 500;
          cursor: pointer;
        }

        .transactions-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .transaction-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 10px;
        }

        .txn-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }

        .txn-icon.credit {
          background: #d1fae5;
          color: #059669;
        }

        .txn-icon.debit {
          background: #fee2e2;
          color: #dc2626;
        }

        .txn-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .txn-desc {
          font-weight: 500;
          color: #1e293b;
        }

        .txn-date {
          font-size: 0.75rem;
          color: #64748b;
        }

        .txn-amount {
          font-weight: 600;
        }

        .txn-amount.credit {
          color: #059669;
        }

        .txn-amount.debit {
          color: #dc2626;
        }

        /* Commission Card */
        .commission-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .commission-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .commission-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 0.25rem;
        }

        .commission-note {
          font-size: 0.8rem;
          color: #94a3b8;
          margin-bottom: 1rem;
        }

        .btn-pay-commission {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-pay-commission:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }

        /* Quick Links Card */
        .quick-links-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .quick-links-card h6 {
          margin-bottom: 1rem;
          color: #1e293b;
          font-weight: 600;
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
          gap: 0.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 10px;
          text-decoration: none;
          color: #64748b;
          transition: all 0.2s ease;
        }

        .quick-link:hover {
          background: #dbeafe;
          color: #3b82f6;
        }

        .quick-link i {
          font-size: 1.25rem;
        }

        .quick-link span {
          font-size: 0.75rem;
          font-weight: 500;
        }

        /* Empty & Loading */
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #94a3b8;
        }

        .empty-state i {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .skeleton-text {
          height: 1.5rem;
          width: 120px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
        }

        .skeleton-text.large {
          height: 3rem;
          width: 200px;
        }

        .skeleton-transaction {
          height: 60px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 10px;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .balance-amount {
            font-size: 2rem;
          }

          .balance-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .balance-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default ProdWallet;
