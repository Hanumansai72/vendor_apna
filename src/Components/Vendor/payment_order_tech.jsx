import React from 'react';
import { Alert, Card, Row, Col, Badge, Button } from 'react-bootstrap';
import { BsCash } from 'react-icons/bs'; // Bootstrap cash icon

const JobPaymentSummary = () => {
  const handleDownloadReceipt = () => {
    alert('Downloading receipt...');
    // You can trigger actual download logic here
  };

  return (
    <div className="container my-5" style={{ maxWidth: '700px' }}>
      
      {/* Payment success alert */}
      <Alert variant="success" className="text-center">
        Payment Successfully Processed<br />
        <small>Job #12345 has been completed and payment has been processed.</small>
      </Alert>

      {/* Job Payment Breakdown */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5>Job Payment Breakdown</h5>
          <hr />
          <Row className="mb-2">
            <Col sm={4}><strong>Job ID:</strong></Col>
            <Col sm={8}>#12345</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Service Type:</strong></Col>
            <Col sm={8}>Home Cleaning</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Date Completed:</strong></Col>
            <Col sm={8}>April 20, 2025</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Total Job Amount:</strong></Col>
            <Col sm={8}>₹1000</Col>
          </Row>
          <Row className="mb-2">
            <Col sm={4}><strong>Platform Commission (10%):</strong></Col>
            <Col sm={8}>- ₹100</Col>
          </Row>
          <Row className="mt-3 p-2 bg-light rounded">
            <Col sm={4}><strong>Your Earnings:</strong></Col>
            <Col sm={8} className="text-primary fw-bold fs-5">₹900</Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payment Information */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5>Payment Information</h5>
          <hr />
          <Row className="mb-3">
            <Col sm={4}><strong>Payment Method:</strong></Col>
            <Col sm={8}>
              <BsCash className="me-2" />
              Cash Collected
            </Col>
          </Row>
          <Row className="mb-4">
            <Col sm={4}><strong>Payment Status:</strong></Col>
            <Col sm={8}>
              <Badge bg="success">Completed</Badge>
            </Col>
          </Row>

          <div className="text-center">
            <Button variant="secondary" onClick={handleDownloadReceipt}>
              ⬇️ Download Receipt
            </Button>
          </div>
        </Card.Body>
      </Card>

    </div>
  );
};

export default JobPaymentSummary;
