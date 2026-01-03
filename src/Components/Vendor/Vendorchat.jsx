import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { socket } from "../Login/Signup/socket";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../Auth/AuthContext";
import API_BASE_URL from "../../config";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";

export default function VendorChat() {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  /* ---------------- LOAD VENDOR CONVERSATIONS ---------------- */
  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`${API_BASE_URL}/api/chat/conversations/vendor/${vendorId}`)
      .then((res) => {
        setConversations(res.data);
        if (res.data.length > 0 && !activeConversation) {
          setActiveConversation(res.data[0]);
        }
      })
      .catch((err) => console.error("Load conversations failed", err))
      .finally(() => setLoading(false));
  }, [vendorId]);

  /* ---------------- JOIN SOCKET ROOM ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

    socket.emit("joinConversation", activeConversation._id);

    const handler = (msg) => {
      if (msg.conversationId === activeConversation._id) {
        setMessages((prev) => {
          if (prev.find(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receiveMessage", handler);

    return () => socket.off("receiveMessage", handler);
  }, [activeConversation]);

  /* ---------------- LOAD MESSAGES ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

    setMessages([]); // reset when switching chats

    axios
      .get(`${API_BASE_URL}/api/chat/messages/${activeConversation._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Load messages failed", err));
  }, [activeConversation]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim() || !activeConversation) return;

    const payload = {
      conversationId: activeConversation._id,
      senderId: vendorId,
      senderType: "vendor",
      message: input.trim(),
    };

    setInput("");

    // Optimistic UI
    const tempId = Date.now().toString();
    setMessages((prev) => [
      ...prev,
      { ...payload, _id: tempId, createdAt: new Date() },
    ]);

    socket.emit("sendMessage", payload);

    try {
      await axios.post(`${API_BASE_URL}/api/chat/message`, payload);
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <Navbar />

      <style>{`
        .chat-wrapper {
          height: calc(100vh - 160px);
          max-width: 1200px;
          margin: 20px auto;
          background: #fff;
          border-radius: 24px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,0.06);
        }
        .sidebar {
          width: 350px;
          border-right: 1px solid #f0f0f0;
          display: flex;
          flex-direction: column;
          background: #fff;
        }
        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid #f0f0f0;
        }
        .convo-list {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }
        .convo-item {
          padding: 12px 16px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          margin-bottom: 8px;
        }
        .convo-item:hover {
          background: #f8f9fa;
        }
        .convo-item.active {
          background: #fff9e6;
          border: 1px solid #eee;
        }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #fdfdfd;
        }
        .chat-header {
          padding: 16px 24px;
          background: #fff;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
        }
        .message-box {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          background: #f7f9fb;
        }
        .msg-bubble {
          max-width: 70%;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 0.95rem;
          line-height: 1.5;
          position: relative;
        }
        .msg-vendor {
          background: #333;
          color: #fff;
          margin-left: auto;
          border-radius: 18px 18px 4px 18px;
        }
        .msg-customer {
          background: #fff;
          color: #333;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid #f0f0f0;
        }
        .chat-input-area {
          padding: 20px 24px;
          background: #fff;
          border-top: 1px solid #f0f0f0;
        }
        .vendor-input {
          border: 1px solid #eee;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 12px 20px;
        }
        .vendor-input:focus {
          background: #fff;
          box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.3);
          border-color: #ffd700;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
        }
        @media (max-width: 992px) {
          .sidebar { width: 80px; }
          .sidebar-header h5, .convo-item .convo-info { display: none; }
          .convo-item { justify-content: center; padding: 12px; }
        }
      `}</style>

      <div className="container-fluid px-md-4 flex-grow-1">
        <div className="chat-wrapper">
          {/* SIDEBAR */}
          <div className="sidebar">
            <div className="sidebar-header">
              <h5 className="fw-bold mb-0">Direct Messages</h5>
            </div>
            <div className="convo-list">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  className={`convo-item ${activeConversation?._id === c._id ? "active" : ""}`}
                  onClick={() => setActiveConversation(c)}
                >
                  <img
                    src={c.userId?.Profile_Image || `https://ui-avatars.com/api/?name=${c.userId?.Full_Name || 'C'}&background=random`}
                    className="rounded-circle me-3"
                    width="44"
                    height="44"
                    style={{ objectFit: 'cover' }}
                    alt=""
                  />
                  <div className="convo-info overflow-hidden">
                    <div className="fw-bold text-truncate" style={{ fontSize: '0.9rem' }}>
                      {c.userId?.Full_Name || "Customer"}
                    </div>
                    <small className="text-muted text-truncate d-block">
                      {c.lastMessage || "No messages yet"}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAIN CHAT */}
          <div className="chat-main">
            {activeConversation ? (
              <>
                <div className="chat-header">
                  <img
                    src={activeConversation.userId?.Profile_Image || `https://ui-avatars.com/api/?name=${activeConversation.userId?.Full_Name || 'C'}&background=random`}
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                    alt=""
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-0 fw-bold">{activeConversation.userId?.Full_Name || "Customer"}</h6>
                    <div className="d-flex align-items-center gap-2">
                      <div className="status-dot"></div>
                      <small className="text-muted" style={{ fontSize: '0.7rem' }}>Active now</small>
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <button className="btn btn-light rounded-circle"><i className="bi bi-info-circle"></i></button>
                  </div>
                </div>

                <div ref={scrollRef} className="message-box d-flex flex-column">
                  <AnimatePresence>
                    {messages.map((m, i) => (
                      <motion.div
                        key={m._id || i}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`msg-bubble ${m.senderType === "vendor" ? "msg-vendor" : "msg-customer"}`}
                      >
                        {m.message}
                        <div className={`mt-1 text-end ${m.senderType === "vendor" ? "text-light" : "text-muted"}`} style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="chat-input-area">
                  <div className="d-flex align-items-center gap-3">
                    <button className="btn btn-link link-dark"><i className="bi bi-paperclip fs-5"></i></button>
                    <div className="flex-grow-1">
                      <input
                        className="form-control vendor-input shadow-none"
                        placeholder="Write a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      />
                    </div>
                    <button
                      className="btn btn-warning px-4 fw-bold rounded-3 shadow-sm"
                      onClick={handleSend}
                    >
                      Send <i className="bi bi-send-fill ms-1"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                <i className="bi bi-chat-left-dots" style={{ fontSize: '4rem' }}></i>
                <p className="mt-3">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-auto">
        <Footer />
      </div>
    </div>
  );
}
