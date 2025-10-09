import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useParams } from "react-router-dom";
import { socket } from "../socket";
import "bootstrap/dist/css/bootstrap.min.css";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app"
    : "http://localhost:5000";

export default function VendorChat() {
  const { customerId } = useParams();
  const vendorId = localStorage.getItem("vendorid") || "";
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(customerId || null);
  const [messages, setMessages] = useState({});
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [customerDetails, setCustomerDetails] = useState(null);
  const scrollRef = useRef(null);

  // Join vendor socket room
  useEffect(() => {
    if (!vendorId) return;
    socket.emit("joinRoom", vendorId);

    const handler = (msg) => {
      const otherId = msg.senderId === vendorId ? msg.receiverId : msg.senderId;
      setMessages((prev) => ({
        ...prev,
        [otherId]: [...(prev[otherId] || []), msg],
      }));
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [vendorId]);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeId, messages]);

  // Load all conversations for vendor
  useEffect(() => {
    if (!vendorId) return;
    const loadConversations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/messages/vendor/${vendorId}`);
        const convMap = {};
        res.data.forEach((msg) => {
          const otherId = msg.senderId === vendorId ? msg.receiverId : msg.senderId;
          if (!convMap[otherId]) convMap[otherId] = [];
          convMap[otherId].push(msg);
        });

        const convs = Object.entries(convMap).map(([otherId, msgs]) => {
          const last = msgs[msgs.length - 1];
          return {
            id: otherId,
            name:
              last.senderId === vendorId
                ? last.receiverId.Full_Name
                : last.senderId.Full_Name,
            avatar:
              last.senderId === vendorId
                ? last.receiverId.Profile_Image || "https://i.pravatar.cc/80?img=3"
                : last.senderId.Profile_Image || "https://i.pravatar.cc/80?img=3",
            lastMessage: last.text,
            lastTime: new Date(last.time).toLocaleTimeString(),
          };
        });

        setConversations(convs);
        setMessages(convMap);
        if (!activeId && convs.length > 0) setActiveId(convs[0].id);
      } catch (err) {
        console.error("Error loading vendor conversations:", err);
      }
    };

    loadConversations();
  }, [vendorId]);

  // Fetch active customer's details
  useEffect(() => {
    if (!activeId) return;
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/customer/${activeId}`);
        setCustomerDetails(res.data);
      } catch (err) {
        setCustomerDetails(null);
      }
    };
    fetchCustomer();
  }, [activeId]);

  // Load active conversation
  useEffect(() => {
    if (!activeId || messages[activeId]?.length > 0) return;
    const fetchThread = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/messages/conversation/${vendorId}/${activeId}`
        );
        setMessages((prev) => ({ ...prev, [activeId]: res.data || [] }));
      } catch (err) {
        console.error("Error fetching vendor conversation:", err);
      }
    };
    fetchThread();
  }, [activeId, vendorId, messages]);

  const handleSend = async () => {
    if (!input.trim() || !activeId) return;
    const msgData = {
      senderId: vendorId,
      senderModel: "Vendor",
      receiverId: activeId,
      receiverModel: "Customer",
      text: input.trim(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] || []), { ...msgData, time: new Date().toISOString() }],
    }));
    setInput("");
    socket.emit("sendMessage", msgData);
    try {
      await axios.post(`${API_BASE}/api/messages/vendor/send`, msgData);
    } catch (err) {
      console.error("Message send failed", err);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  const activeMessages = messages[activeId] || [];

  return (
    <div className="container-fluid p-3">
      <div className="row g-3">
        {/* Sidebar */}
        <div className="col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <input
                className="form-control mb-3"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div style={{ maxHeight: "75vh", overflowY: "auto" }}>
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`d-flex align-items-center p-2 mb-2 rounded ${
                      conv.id === activeId ? "bg-white" : "bg-light"
                    }`}
                    onClick={() => setActiveId(conv.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={conv.avatar}
                      alt=""
                      className="rounded-circle me-2"
                      width="46"
                      height="46"
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{conv.name}</div>
                      <small className="text-muted">{conv.lastMessage}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="col-lg-6">
          <div className="card h-100 d-flex flex-column">
            <div className="card-header bg-white border-bottom">
              <h6 className="mb-0">
                {customerDetails?.Full_Name || "Select a Customer"}
              </h6>
            </div>
            <div
              ref={scrollRef}
              className="flex-grow-1 p-3"
              style={{ overflowY: "auto", background: "#f7f9fb" }}
            >
              <AnimatePresence>
                {activeMessages.map((m, i) => (
                  <motion.div
                    key={m._id || i}
                    className={`d-flex mb-3 ${
                      m.senderId === vendorId
                        ? "justify-content-end"
                        : "justify-content-start"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div
                      className={`p-2 rounded ${
                        m.senderId === vendorId
                          ? "bg-warning text-dark"
                          : "bg-white"
                      }`}
                      style={{ maxWidth: "70%" }}
                    >
                      {m.text}
                      <div className="text-end">
                        <small className="text-muted" style={{ fontSize: 12 }}>
                          {new Date(m.time).toLocaleTimeString()}
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
                  type="text"
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

        {/* Customer Info */}
        <div className="col-lg-3">
          <div className="card h-100">
            <div className="card-body text-center">
              {customerDetails ? (
                <>
                  <img
                    src={
                      customerDetails.Profile_Image ||
                      "https://i.pravatar.cc/100?img=5"
                    }
                    alt=""
                    className="rounded-circle mb-2"
                    width="100"
                    height="100"
                  />
                  <h6>{customerDetails.Full_Name}</h6>
                  <p className="text-muted mb-1">
                    {customerDetails.Email || "No email available"}
                  </p>
                  <p className="text-muted mb-0">
                    {customerDetails.Phone || ""}
                  </p>
                </>
              ) : (
                <p className="text-muted">Select a customer</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
