import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { socket } from "../Login/Signup/socket";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app"
    : "http://localhost:5000";

export default function VendorChat() {
  const vendorId = localStorage.getItem("vendorId");

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const scrollRef = useRef(null);

  /* ---------------- LOAD VENDOR CONVERSATIONS ---------------- */
  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`${API_BASE}/api/chat/conversations/vendor/${vendorId}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("Load conversations failed", err));
  }, [vendorId]);

  /* ---------------- JOIN SOCKET ROOM ---------------- */
  useEffect(() => {
    if (!activeConversation?._id) return;

    socket.emit("joinConversation", activeConversation._id);

    const handler = (msg) => {
      if (msg.conversationId === activeConversation._id) {
        setMessages((prev) => [...prev, msg]);
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
      .get(`${API_BASE}/api/chat/messages/${activeConversation._id}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("Load messages failed", err));
  }, [activeConversation]);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    // optimistic UI
    setMessages((prev) => [
      ...prev,
      { ...payload, createdAt: new Date() },
    ]);

    socket.emit("sendMessage", payload);

    try {
      await axios.post(`${API_BASE}/api/chat/message`, payload);
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  return (
    <div className="container-fluid p-3">
      <div className="row g-3">

        {/* SIDEBAR */}
        <div className="col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              {conversations.map((c) => (
                <div
                  key={c._id}
                  className={`d-flex align-items-center p-2 mb-2 rounded ${
                    activeConversation?._id === c._id ? "bg-white" : "bg-light"
                  }`}
                  onClick={() => setActiveConversation(c)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={c.userId?.Profile_Image || "https://i.pravatar.cc/80"}
                    className="rounded-circle me-2"
                    width="46"
                    height="46"
                    alt=""
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      {c.userId?.Full_Name || "Customer"}
                    </div>
                    <small className="text-muted">{c.lastMessage}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT */}
        <div className="col-lg-9">
          <div className="card h-100 d-flex flex-column">
            <div className="card-header bg-white border-bottom">
              <strong>
                {activeConversation?.userId?.Full_Name || "Select a customer"}
              </strong>
            </div>

            <div
              ref={scrollRef}
              className="flex-grow-1 p-3"
              style={{ overflowY: "auto", background: "#f7f9fb" }}
            >
              <AnimatePresence>
                {messages.map((m, i) => (
                  <motion.div
                    key={m._id || i}
                    className={`d-flex mb-3 ${
                      m.senderType === "vendor"
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`p-2 rounded ${
                        m.senderType === "vendor"
                          ? "bg-warning"
                          : "bg-white"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      {m.message}
                      <div className="text-end">
                        <small className="text-muted">
                          {new Date(m.createdAt).toLocaleTimeString()}
                        </small>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="card-footer bg-white border-top">
              <div className="d-flex gap-2">
                <input
                  className="form-control"
                  placeholder="Type a message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <button className="btn btn-warning" onClick={handleSend}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
