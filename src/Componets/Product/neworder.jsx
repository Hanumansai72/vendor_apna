import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Form, Toast, ToastContainer } from "react-bootstrap";
import ProductNavbar from "./productnav";
import axios from "axios";
import API_BASE_URL from "../../config";
import { FiRefreshCw, FiDownload } from "react-icons/fi";
import Footer from "../Navbar/footer";

const id = localStorage.getItem("vendorId");

const getStatusBadge = (status) => {
  switch (status) {
    case "Delivered":
      return <Badge bg="success">Delivered</Badge>;
    case "Pending":
      return <Badge bg="warning">Pending</Badge>;
    case "Processing":
      return <Badge bg="info">Processing</Badge>;
    case "Shipped":
      return <Badge bg="primary">Shipped</Badge>;
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

  // 🧠 Fetch all vendor orders
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/pending-orders/${id}`);
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

  // ✅ Update order status via dropdown
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(`${API_BASE_URL}/update-order-status/${orderId}`, {
        orderStatus: newStatus,
      });

      setFiltered((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, orderStatus: newStatus } : o
        )
      );

      showToast(`Order status updated to ${newStatus}`, "success");
    } catch (err) {
      console.error("Error updating order status:", err);
      showToast("Failed to update order status.", "danger");
    }
  };



  return (
    <>
      <div className="orders-page bg-light min-vh-100">
        <ProductNavbar />
        <div className="container py-4">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h4 className="fw-bold mb-0">Manage Orders</h4>
              <p className="text-muted mb-0">View and update order statuses easily</p>
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
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
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
              No orders found for this vendor.
            </div>
          ) : (
            <Table responsive hover className="bg-white rounded-3 shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th>Status</th>
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
                    <td>
                      <Form.Select
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        style={{
                          width: "150px",
                          fontSize: "0.9rem",
                          backgroundColor: "#f8f9fa",
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </Form.Select>
                      <div className="mt-1">{getStatusBadge(order.orderStatus)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}


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
      </div><Footer></Footer></>
  );
};

export default NewOrders;
