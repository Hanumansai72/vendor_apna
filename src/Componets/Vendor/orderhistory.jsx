import React, { useEffect, useState } from 'react';
import { Table, Badge, Button, Form, Row, Col, Pagination, Image } from 'react-bootstrap';
import Navbar from './navbar';
import axios from 'axios';

const OrderHistory = () => {
  const id = localStorage.getItem("vendorId");
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [dateFilter, setDateFilter] = useState("Last 30 days");
  const [statusFilter, setStatusFilter] = useState("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`https://backend-d6mx.vercel.app/wow/${id}?page=${currentPage}&limit=${itemsPerPage}`);
        const allOrders = res.data.all || [];
        setOrders(allOrders);
        setTotalOrders(res.data.total || 0);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };
    fetchOrder();
  }, [id, currentPage]);

  useEffect(() => {
    let filtered = [...orders];
    const now = new Date();

    filtered = filtered.filter(order => {
      const orderDate = new Date(order.orderedAt);
      if (dateFilter === "Last 7 days") {
        return now - orderDate <= 7 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "Last 30 days") {
        return now - orderDate <= 30 * 24 * 60 * 60 * 1000;
      } else if (dateFilter === "This Year") {
        return orderDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    if (statusFilter !== "All" && statusFilter !== "All statuses") {
      filtered = filtered.filter(order => order.orderStatus === statusFilter);
    }

    if (clientFilter !== "All" && clientFilter !== "All clients") {
      filtered = filtered.filter(order => order.customerName === clientFilter);
    }

    if (searchQuery.trim() !== "") {
      const lowerSearch = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        (order._id || "").toLowerCase().includes(lowerSearch) ||
        (order.customerName || "").toLowerCase().includes(lowerSearch) ||
        (order.productId || "").toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredOrders(filtered);
  }, [orders, dateFilter, statusFilter, clientFilter, searchQuery]);

  useEffect(() => {
    setCurrentPage(1); // Reset page on filter change
  }, [dateFilter, statusFilter, clientFilter, searchQuery]);

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'Delivered': return <Badge bg="success">Delivered</Badge>;
      case 'In Transit': return <Badge bg="info">In Transit</Badge>;
      case 'Pending': return <Badge bg="warning">Pending</Badge>;
      case 'Cancelled': return <Badge bg="danger">Cancelled</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const clientOptions = Array.from(new Set(orders.map(o => o.customerName))).filter(Boolean);
  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <div>
      <Navbar
        homeLabel="Home"
        homeUrl={`/Product/${id}`}
        jobsLabel="Products"
        jobsUrl={`/product/${id}/ViewProduct`}
        historyLabel="New Orders"
        historyUrl={`/product/${id}/order`}
        earningsLabel="Order History"
        earningsUrl={`/product/${id}/order/history`}
      />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Order History</h4>
          <Button variant="outline-secondary">📥 Export</Button>
        </div>

        {/* Filters */}
        <Row className="mb-3">
          <Col md={3}>
            <Form.Select value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This Year</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option>All statuses</option>
              <option>Delivered</option>
              <option>In Transit</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
              <option>All clients</option>
              {clientOptions.map((client, idx) => (
                <option key={idx}>{client}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Search orders..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </Col>
        </Row>

        {/* Table */}
        <Table responsive bordered hover>
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Product</th>
              <th>Customer Name</th>
              <th>Quantity</th>
              <th>Price/Unit</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Ordered On</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="9" className="text-center">No orders found.</td></tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr key={index}>
                  <td>{order._id}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <Image src={order.productImage} alt={order.productName} width={50} height={50} rounded className="me-2" />
                      <span>{order.productName}</span>
                    </div>
                  </td>
                  <td>{order.customerName}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.pricePerUnit}</td>
                  <td>₹{order.totalPrice}</td>
                  <td><StatusBadge status={order.orderStatus} /></td>
                  <td>
                    <Badge bg={
                      order.paymentStatus === 'Paid' ? 'success'
                        : order.paymentStatus === 'Failed' ? 'danger'
                        : 'warning'
                    }>
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td>{new Date(order.orderedAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        {/* Pagination */}
        <Pagination className="justify-content-end">
          <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
          {Array.from({ length: totalPages }, (_, i) => (
            <Pagination.Item
              key={i + 1}
              active={currentPage === i + 1}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>
    </div>
  );
};

export default OrderHistory;
