import React, { useEffect, useState } from "react";
import { api } from "../../config";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Navbar/navbar";
import { useAuth } from "../Auth/AuthContext";
import Footer from "../Navbar/footer";

export default function VendorInbox() {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!vendorId) return;

    const fetchInbox = async () => {
      try {
        const res = await api.get(`/api/chat/inbox/vendor/${vendorId}`);
        setConversations(res.data);
      } catch (err) {
        console.error("Vendor inbox error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInbox();
  }, [vendorId]);

  return (
    <div className="min-vh-100 d-flex flex-column bg-soft">
      <Navbar />

      <style>{`
        .bg-soft { background-color: #f4f7f9; }
        .glass-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          padding: 30px 0;
          margin-bottom: 40px;
        }
        .convo-card {
          background: #fff;
          border-radius: 16px;
          border: 1px solid #eef2f6;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .convo-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.05);
          border-color: #ffd700;
        }
        .avatar-box {
          width: 60px;
          height: 60px;
          border-radius: 14px;
          overflow: hidden;
          background: #f0f2f5;
          flex-shrink: 0;
        }
        .avatar-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .unread-indicator {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: #ffd700;
          display: none;
        }
        .convo-card.new .unread-indicator {
          display: block;
        }
        .last-time {
          font-size: 0.75rem;
          color: #adb5bd;
        }
      `}</style>

      <div className="glass-header text-center">
        <div className="container">
          <h2 className="fw-900 mb-1">Customer Conversations</h2>
          <p className="text-muted">Manage your client inquiries and active projects</p>
        </div>
      </div>

      <div className="container py-2 flex-grow-1">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-dark" role="status"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-chat-dots text-muted" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="text-muted">No messages yet</h5>
            <p className="small text-muted">New customer inquiries will appear here.</p>
          </div>
        ) : (
          <div className="row g-4 mb-5">
            <AnimatePresence>
              {conversations.map((c, idx) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="col-12"
                >
                  <div
                    className="convo-card p-3 d-flex align-items-center cursor-pointer"
                    onClick={() => {
                      // Store the conversation ID for the chat component
                      localStorage.setItem("activeConversationId", c._id);
                      navigate(`/vendor/${vendorId}/chat`);
                    }}
                  >
                    <div className="unread-indicator"></div>
                    <div className="avatar-box me-3">
                      <img
                        src={c.userId?.Profile_Image || `https://ui-avatars.com/api/?name=${c.userId?.Full_Name || 'C'}&background=random`}
                        alt=""
                      />
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-bold text-truncate pe-3">
                          {c.userId?.Full_Name || "Customer"}
                        </h6>
                        <span className="last-time">
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div className="d-flex align-items-center">
                        <p className="mb-0 text-muted text-truncate small flex-grow-1">
                          {c.lastMessage || "Started a new conversation"}
                        </p>
                        <i className="bi bi-chevron-right text-muted ms-2" style={{ fontSize: '0.8rem' }}></i>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
