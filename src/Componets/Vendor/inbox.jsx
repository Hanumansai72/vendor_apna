import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Navbar/navbar";

const API_BASE =
  process.env.NODE_ENV === "production"
    ? "https://backend-d6mx.vercel.app"
    : "http://localhost:5000";

export default function VendorInbox() {
  const vendorId = localStorage.getItem("vendorId");
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`${API_BASE}/api/chat/inbox/vendor/${vendorId}`)
      .then((res) => setConversations(res.data))
      .catch((err) => console.error("Vendor inbox error:", err));
  }, [vendorId]);

  return (
    <>
    <Navbar></Navbar>
    <div className="container py-3">
      <h5 className="mb-3">Customer Chats</h5>

      {conversations.length === 0 && (
        <p className="text-muted">No conversations yet</p>
      )}

      {conversations.map((c) => (
        <div
          key={c._id}
          className="d-flex align-items-center p-2 mb-2 rounded bg-light"
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate(`/vendor/${c._id}/chat`)
          }
        >
          <img
            src={c.userId.Profile_Image || "https://i.pravatar.cc/60"}
            alt=""
            className="rounded-circle me-2"
            width="46"
            height="46"
          />
          <div>
            <div style={{ fontWeight: 600 }}>
              {c.userId.Full_Name}
            </div>
            <small className="text-muted">{c.lastMessage}</small>
          </div>
        </div>
      ))}
    </div>
    </>
  );
}
