import React from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import Navbar from './navbar';


const OrderStatus = () => {
  return (
    <div>
<Navbar
        homeLabel="Home"
        homeUrl="/vendor/product/dashboard"
        jobsLabel="Products"
        jobsUrl="/vendor/neworder"    
        historyLabel="Orders History"
        historyUrl="/vendor/ordershistory" 
        earningsLabel="Earnings"
        earningsUrl="/vendor/earnings"   
      />
    <div className="container my-5">
      <Button variant="link" className="mb-4">&larr; Back to Orders</Button>

      <Row>
        {/* Left Section */}
        <Col md={8}>
          <Card className="mb-4 p-4">
            <h4>Order Status</h4>
            <Row className="mb-3">
              <Col>
                <strong>Order ID</strong>
                <div>#ORD-25789</div>
              </Col>
              <Col>
                <strong>Order Date</strong>
                <div>April 22, 2025, 10:43 AM</div>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <strong>Product Name</strong>
                <div>Ergonomic Office Chair - Black</div>
              </Col>
              <Col>
                <strong>Quantity</strong>
                <div>2</div>
              </Col>
            </Row>

            <h5 className="mt-4">Customer Information</h5>
            <Row className="mb-3">
              <Col>
                <strong>Customer Name</strong>
                <div>Michael Johnson</div>
              </Col>
              <Col>
                <strong>Contact</strong>
                <div>+1 (555) 123-4567</div>
              </Col>
            </Row>
            <div className="mb-3">
              <strong>Delivery Address</strong>
              <div>1234 Business Park Ave, Suite 100, San Francisco, CA 94107</div>
            </div>

            <h5 className="mt-4">Special Instructions</h5>
            <div className="bg-light p-3 rounded mb-3">
              Please deliver during business hours (9 AM - 5 PM). Call customer 30 minutes before arrival. Leave packages at the reception desk if no one is available to receive.
            </div>

            <h5 className="mt-4">Order Timeline</h5>
            <div className="mt-3">
              <div className="d-flex align-items-start mb-3">
                <div className="me-3 text-success">&#10004;</div>
                <div>
                  <strong>April 22, 2025, 10:43 AM</strong><br />
                  Order Received
                </div>
              </div>
              <div className="d-flex align-items-start mb-3">
                <div className="me-3 text-success">&#10004;</div>
                <div>
                  <strong>April 22, 2025, 11:15 AM</strong><br />
                  Order Accepted<br />
                  <small className="text-muted">Order has been reviewed and accepted for processing</small>
                </div>
              </div>
              <div className="d-flex align-items-start">
                <div className="me-3 text-muted">&#9711;</div>
                <div>
                  <strong>Expected by April 25, 2025</strong><br />
                  Delivery
                </div>
              </div>
            </div>

            <Button variant="outline-primary" className="mt-4">Contact Customer</Button>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="mb-4 p-4">
            <h5>Current Status</h5>
            <Badge bg="success" className="mb-2">Accepted</Badge>
            <div className="text-muted mb-3">Status updated on<br />April 22, 2025, 11:15 AM</div>

            <h5>Delivery Information</h5>
            <div><strong>Delivery Method:</strong> Standard Shipping</div>
            <div><strong>Estimated Delivery:</strong> April 25, 2025</div>
            <div><strong>Tracking Number:</strong> <a href="/">TRK4587654321</a></div>

            <h5 className="mt-4">Payment Details</h5>
            <div><strong>Payment Method:</strong> Visa **** 4567</div>
            <div><strong>Subtotal:</strong> $299.98</div>
            <div><strong>Shipping:</strong> $12.99</div>
            <div><strong>Tax:</strong> $29.99</div>
            <hr />
            <div><strong>Total:</strong> $342.96</div>

            <Button variant="dark" className="mt-4 w-100">Print Order Details</Button>
            <Button variant="outline-secondary" className="mt-2 w-100">Download Invoice</Button>
          </Card>
        </Col>
      </Row>
    </div></div>
  );
};

export default OrderStatus;
