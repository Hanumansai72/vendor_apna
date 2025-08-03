import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Form, Row, Col, Pagination, Modal } from 'react-bootstrap';
import Navbar from './navbar';
import { Link } from 'react-router-dom';
import axios from 'axios';

const id = localStorage.getItem("vendorId");

const StatusBadge = (status) => {
  switch (status) {
    case 'Delivered': return <Badge bg="success">Delivered</Badge>;
    case 'Processing': return <Badge bg="info">Processing</Badge>;
    case 'Pending': return <Badge bg="warning">Pending</Badge>;
    case 'Cancelled': return <Badge bg="danger">Cancelled</Badge>;
    default: return <Badge bg="secondary">{status}</Badge>;
  }
};

const NewHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`https://backend-d6mx.vercel.app/pending-orders/${id}`);
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleStatusUpdate = async () => {
    try {
      await axios.put(`https://backend-d6mx.vercel.app/update-order-status/${selectedOrder._id}`, {
        orderStatus: newStatus
      });
      handleCloseModal();
      fetchOrders(); 
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const handleSearch = (query) => {
    setSearchQuery(query);
    const lower = query.toLowerCase();
    const result = orders.filter(o =>
      o.customerName?.toLowerCase().includes(lower) ||
      o.productName?.toLowerCase().includes(lower) ||
      o._id?.toLowerCase().includes(lower)
    );
    setFilteredOrders(result);
  };

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
          <h4>New Orders</h4>
        </div>

        <Row className="mb-3">
          <Col><Form.Control placeholder="Search..." value={searchQuery} onChange={e => handleSearch(e.target.value)} /></Col>
        </Row>

        {filteredOrders.length === 0 ? (
          <div className="alert alert-info">No pending orders.</div>
        ) : (
          <Table responsive bordered hover>
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Status</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => (
                <tr key={idx}>
                  <td>{order._id}</td>
                  <td>{order.customerName}</td>
                  <td>{order.productName}</td>
                  <td>{formatDate(order.orderedAt)}</td>
                  <td>{StatusBadge(order.orderStatus)}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.totalPrice}</td>
                  <td>
                    <Button size="sm" variant="outline-primary" onClick={() => handleViewDetails(order)}>
                      📋 View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

        <Pagination className="justify-content-end">
          <Pagination.Item active>1</Pagination.Item>
          <Pagination.Item>2</Pagination.Item>
        </Pagination>

        {/* Modal */}
        <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Order Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <h5>{selectedOrder.productName}</h5>
                <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                <p><strong>Quantity:</strong> {selectedOrder.quantity}</p>
                <p><strong>Shipping:</strong> {selectedOrder.shippingAddress?.fullAddress}</p>

                <Form.Group className="mb-3">
                  <Form.Label>Change Order Status</Form.Label>
                  <Form.Select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option>Pending</option>
                    <option>Processing</option>
                    <option>Shipped</option>
                    <option>Delivered</option>
                    <option>Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
            <Button variant="primary" onClick={handleStatusUpdate}>Update Status</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default NewHistory;
