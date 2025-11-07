import React, { useState, useEffect } from "react";
import { Table, Badge, Button, Form, Modal } from "react-bootstrap";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://backend-d6mx.vercel.app/pending-orders/${id}`
      );
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
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

  const handleView = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.put(
        `https://backend-d6mx.vercel.app/update-order-status/${selectedOrder._id}`,
        { orderStatus: newStatus }
      );
      fetchOrders();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAccept = (orderId) => {
    setFiltered((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: "Processing" } : o
      )
    );
  };

  const handleReject = (orderId) => {
    setFiltered((prev) =>
      prev.map((o) =>
        o._id === orderId ? { ...o, orderStatus: "Cancelled" } : o
      )
    );
  };

  // Dummy analytics data
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

        {/* Filters */}
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

        {/* Skeleton Animation */}
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
                <th>Order Date</th>
                <th>Priority</th>
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
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: 36,
                          height: 36,
                          background: "#f5f7fa",
                        }}
                      >
                        🧰
                      </div>
                      <div>
                        <div className="fw-semibold">{order.productName}</div>
                        <small className="text-muted">SKU: {order.productId}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <img
                        src={`https://ui-avatars.com/api/?name=${order.customerName}`}
                        alt="avatar"
                        className="rounded-circle"
                        width={36}
                        height={36}
                      />
                      <div>
                        <div className="fw-semibold">{order.customerName}</div>
                        <small className="text-muted">{order.customerPhone}</small>
                      </div>
                    </div>
                  </td>
                  <td>{order.quantity}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    {new Date(order.orderedAt).toLocaleDateString()} <br />
                    <small className="text-muted">
                      {new Date(order.orderedAt).toLocaleTimeString()}
                    </small>
                  </td>
                  <td>{getPriorityBadge(order.priority || "Normal")}</td>
                  <td>
                    {order.orderStatus === "Pending" ? (
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
                    ) : (
                      getStatusBadge(order.orderStatus)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        {/* Order Trends + Top Categories */}
        <div className="row mt-4 g-4">
          <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold">Order Trends</h6>
                <span className="text-warning fw-semibold">View Details</span>
              </div>
              <div className="mt-3">
                <p className="mb-1">Response Rate</p>
                <div className="progress mb-2">
                  <div className="progress-bar bg-success" style={{ width: "92%" }}></div>
                </div>
                <p className="mb-1">Acceptance Rate</p>
                <div className="progress mb-2">
                  <div className="progress-bar bg-warning" style={{ width: "88%" }}></div>
                </div>
                <p className="mb-1">Avg Response Time</p>
                <div className="progress">
                  <div className="progress-bar bg-primary" style={{ width: "60%" }}></div>
                </div>
                <p className="small mt-1 text-muted">15 mins</p>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-4 bg-white rounded-4 shadow-sm h-100">
              <div className="d-flex justify-content-between">
                <h6 className="fw-bold">Top Categories</h6>
                <span className="text-warning fw-semibold">View All</span>
              </div>
              <div className="mt-3 d-flex flex-column gap-3">
                {[
                  { name: "Electrical", orders: 35, total: "₹18,500", color: "#bfdbfe" },
                  { name: "Plumbing", orders: 28, total: "₹14,200", color: "#dcfce7" },
                  { name: "Painting", orders: 22, total: "₹11,300", color: "#fef9c3" },
                ].map((cat, i) => (
                  <div className="d-flex justify-content-between align-items-center" key={i}>
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "12px",
                          background: cat.color,
                        }}
                      ></div>
                      <div>
                        <div className="fw-semibold">{cat.name}</div>
                        <small className="text-muted">{cat.orders} orders</small>
                      </div>
                    </div>
                    <div className="fw-bold">{cat.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Orders by Category Section */}
        <div className="mt-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold">Orders by Category</h5>
            <span className="text-warning fw-semibold">View All Categories</span>
          </div>
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
    </div>
  );
};

export default NewOrders;
