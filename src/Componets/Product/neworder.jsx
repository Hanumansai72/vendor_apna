import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import ProductNavbar from "./productnav";
import axios from "axios";
import { FiRefreshCw, FiDownload } from "react-icons/fi";

const id = localStorage.getItem("vendorId");

const getPriorityBadge = (priority) => {
  switch (priority) {
    case "Urgent":
      return <Badge bg="danger">Urgent</Badge>;
    case "High":
      return <Badge bg="warning">High</Badge>;
    default:
      return <Badge bg="secondary">Normal</Badge>;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return <Badge bg="success">Delivered</Badge>;
    case "Pending":
      return <Badge bg="warning">Pending</Badge>;
    case "Processing":
      return <Badge bg="info">Processing</Badge>;
    case "Cancelled":
      return <Badge bg="danger">Cancelled</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const NewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
  };

  // 🧠 Fetch all pending/active orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`https://backend-d6mx.vercel.app/pending-orders/${id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      showToast("Failed to load orders.", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const q = e.target.value.toLowerCase();
    setSearch(q);
    setFiltered(
      orders.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(q) ||
          o.productName?.toLowerCase().includes(q) ||
          o._id?.toLowerCase().includes(q)
      )
    );
  };

  // ✅ Accept order → set to "Processing"
  const handleAccept = async (orderId) => {
    try {
      await axios.put(`https://backend-d6mx.vercel.app/update-order-status/${orderId}`, {
        orderStatus: "Processing",
      });

      setFiltered((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "Processing" } : o
        )
      );

      showToast("Order accepted successfully!", "success");
    } catch (err) {
      console.error("Error updating order:", err);
      showToast("Failed to accept order.", "danger");
    }
  };

  // ❌ Reject order → set to "Cancelled"
  const handleReject = async (orderId) => {
    try {
      await axios.put(`https://backend-d6mx.vercel.app/update-order-status/${orderId}`, {
        orderStatus: "Cancelled",
      });

      setFiltered((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o
        )
      );

      showToast("Order rejected successfully.", "warning");
    } catch (err) {
      console.error("Error updating order:", err);
      showToast("Failed to reject order.", "danger");
    }
  };

  // ✅ Mark as Delivered (optional future feature)
  const handleDelivered = async (orderId) => {
    try {
      await axios.put(`https://backend-d6mx.vercel.app/update-order-status/${orderId}`, {
        orderStatus: "Delivered",
      });

      setFiltered((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: "Delivered" } : o
        )
      );

      showToast("Order marked as delivered!", "success");
    } catch (err) {
      console.error("Error marking delivered:", err);
      showToast("Failed to update delivery.", "danger");
    }
  };

  // Dummy analytics for visuals
  const orderCategories = [
    { name: "Construction", count: 12, color: "#fde68a" },
    { name: "Tools", count: 5, color: "#fef9c3" },
    { name: "Hardware", count: 3, color: "#fee2e2" },
    { name: "Electrical", count: 2, color: "#bfdbfe" },
    { name: "Plumbing", count: 1, color: "#dcfce7" },
    { name: "Painting", count: 1, color: "#ede9fe" },
  ];

  return (
    <div className="orders-page bg-light min-vh-100">
      <ProductNavbar />
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h4 className="fw-bold mb-0">New Orders</h4>
            <p className="text-muted mb-0">Orders awaiting your confirmation</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary">
              <FiDownload className="me-1" /> Export
            </Button>
            <Button
              variant="warning"
              className="text-white fw-semibold"
              onClick={fetchOrders}
            >
              <FiRefreshCw className="me-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* Search Filters */}
        <div className="d-flex flex-wrap gap-3 mb-3 align-items-center bg-white p-3 rounded-3 shadow-sm">
          <Form.Select style={{ width: "200px" }}>
            <option>All Orders</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Delivered</option>
          </Form.Select>
          <Form.Select style={{ width: "200px" }}>
            <option>All Categories</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Painting</option>
          </Form.Select>
          <Form.Select style={{ width: "200px" }}>
            <option>Sort by: Latest</option>
            <option>Oldest</option>
            <option>Price: Low to High</option>
          </Form.Select>
          <div className="ms-auto d-flex align-items-center gap-2">
            <Form.Control
              type="text"
              placeholder="🔍 Search by Order ID, Customer, Product..."
              value={search}
              onChange={handleSearch}
              style={{ width: "320px" }}
            />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="skeleton-table my-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton-row mb-3"></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No new or pending orders found.
          </div>
        ) : (
          <Table responsive hover className="bg-white rounded-3 shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order, i) => (
                <tr key={i}>
                  <td>
                    <strong>#{order._id.slice(-6)}</strong>
                    <div className="small text-muted">
                      {new Date(order.orderedAt).toLocaleString()}
                    </div>
                  </td>
                  <td>{order.productName}</td>
                  <td>{order.customerName}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(order.orderStatus)}</td>
                  <td>
                    {order.orderStatus === "Pending" && (
                      <>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleAccept(order._id)}
                        >
                          ✓ Accept
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleReject(order._id)}
                        >
                          ✕ Reject
                        </Button>
                      </>
                    )}

                    {order.orderStatus === "Processing" && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleDelivered(order._id)}
                      >
                        Mark Delivered
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Orders by Category */}
        <div className="mt-5">
          <h5 className="fw-bold mb-3">Orders by Category</h5>
          <div className="d-flex flex-wrap gap-3">
            {orderCategories.map((cat, idx) => (
              <div
                key={idx}
                className="p-3 rounded-4 bg-white shadow-sm text-center"
                style={{
                  width: "150px",
                  borderTop: `4px solid ${cat.color}`,
                }}
              >
                <div className="fw-bold mb-1">{cat.name}</div>
                <div className="text-muted small">{cat.count} Orders</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skeleton animation */}
        <style>{`
          .skeleton-row {
            height: 60px;
            background: linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%);
            background-size: 400% 100%;
            animation: shimmer 1.4s infinite;
            border-radius: 8px;
          }
          @keyframes shimmer {
            0% { background-position: -400px 0; }
            100% { background-position: 400px 0; }
          }
        `}</style>
      </div>

      {/* ✅ Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toast.variant}
          onClose={() => setToast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default NewOrders;
