import React, { useEffect, useState } from "react";
import {
  Table,
  Badge,
  Button,
  Form,
  Row,
  Col,
  Image,
  Pagination,
} from "react-bootstrap";
import axios from "axios";
import API_BASE_URL from "../../config";
import ProductNavbar from "./productnav";
import { FiRefreshCw, FiSettings, FiDownload } from "react-icons/fi";
import Footer from "../Navbar/footer";

const OrderHistory = () => {
  const id = localStorage.getItem("vendorId");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [statusFilter, setStatusFilter] = useState("All Orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/wow/${id}`
        );
        const data = res.data.all || [];
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [id]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const q = query.toLowerCase();
    setFilteredOrders(
      orders.filter(
        (o) =>
          o.productName?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o._id?.toLowerCase().includes(q)
      )
    );
  };

  const StatusBadge = ({ status }) => {
    const colorMap = {
      Delivered: "success",
      Processing: "info",
      Pending: "warning",
      Cancelled: "danger",
      "In Transit": "primary",
    };
    return (
      <Badge bg={colorMap[status] || "secondary"} className="px-3 py-2">
        {status}
      </Badge>
    );
  };

  const PaymentBadge = ({ payment }) => {
    const colorMap = {
      Paid: "success",
      Refunded: "danger",
      Pending: "warning",
    };
    return (
      <Badge bg={colorMap[payment] || "secondary"} className="px-3 py-2">
        {payment}
      </Badge>
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="order-history-page bg-light min-vh-100">
      <ProductNavbar />

      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-1">Recent Orders</h4>
            <p className="text-muted mb-0">
              Track all your previous orders and transactions
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary">
              <FiDownload className="me-1" /> Export
            </Button>
            <Button variant="outline-secondary">
              <FiSettings className="me-1" /> Settings
            </Button>
            <Button variant="warning" className="text-white fw-semibold">
              <FiRefreshCw className="me-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="d-flex flex-wrap justify-content-between align-items-center bg-white p-3 rounded-3 shadow-sm mb-3">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: "160px" }}
            >
              <option>All Orders</option>
              <option>Delivered</option>
              <option>Processing</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </Form.Select>

            <Form.Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{ width: "160px" }}
            >
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Year</option>
            </Form.Select>

            <Button variant="outline-secondary">📅 Date Range</Button>
          </div>

          <Form.Control
            type="text"
            placeholder="🔍 Search orders, customers..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        {/* Skeleton animation */}
        {loading ? (
          <div className="skeleton-table my-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-row mb-3"></div>
            ))}
          </div>
        ) : (
          <>
            <Table hover responsive className="bg-white rounded-4 shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Invoice</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order, i) => (
                    <tr key={i}>
                      <td>
                        <strong>#{order._id?.slice(-4)}</strong>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <Image
                            src={
                              order.productImage ||
                              "https://via.placeholder.com/60x60"
                            }
                            width={50}
                            height={50}
                            rounded
                            alt="product"
                          />
                          <div>
                            <div className="fw-semibold">
                              {order.productName}
                            </div>
                            <small className="text-muted">
                              SKU: {order.productId}
                            </small>
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
                            <div className="fw-semibold">
                              {order.customerName}
                            </div>
                            <small className="text-muted">
                              {order.customerEmail || "example@email.com"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {new Date(order.orderedAt).toLocaleDateString()} <br />
                        <small className="text-muted">
                          {new Date(order.orderedAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold">
                          ₹{order.totalPrice?.toLocaleString()}
                        </div>
                        <small className="text-muted">
                          <PaymentBadge payment={order.paymentStatus} />
                        </small>
                      </td>
                      <td>
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td>
                        <Button variant="link" className="text-warning p-0">
                          ⬇️
                        </Button>
                      </td>
                      <td>⋮</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex justify-content-end mt-3">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() =>
                    setCurrentPage((p) => Math.max(p - 1, 1))
                  }
                  disabled={currentPage === 1}
                />
                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </>
        )}

        {/* Skeleton Animation CSS */}
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
      <Footer></Footer>
    </div>
  );
};

export default OrderHistory;
