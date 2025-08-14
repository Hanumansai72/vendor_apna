import React from 'react';
import { Spinner, ProgressBar, Button, Container, Row, Col } from 'react-bootstrap';
import { FaClock, FaSyncAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function AdminApprovalPending() {
  return (
    <Container fluid className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="shadow p-4 rounded bg-white" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center mb-3">
          <div className="bg-primary bg-opacity-10 rounded-circle p-3 d-inline-block mb-2">
            <FaClock className="text-primary" size={40} />
          </div>
          <h4 className="fw-bold">Your account is under review</h4>
          <p className="text-muted mb-1" style={{ fontSize: '14px' }}>
            APPLICATION <span className="text-primary fw-semibold">#AM-2023-8294</span>
          </p>
        </div>

        <div className="text-center mb-3">
          <ProgressBar>
            <ProgressBar striped variant="success" now={100} label="Submitted" key={1} />
            <ProgressBar striped animated variant="info" now={100} label="In Review" key={2} />
            <ProgressBar variant="secondary" now={0} label="Approved" key={3} />
          </ProgressBar>
        </div>

        <div className="text-center mb-3">
          <p className="text-muted" style={{ fontSize: '14px' }}>
            Thank you for registering with Apna Mestri. Our admin team is currently reviewing your account.
            This typically takes 24–48 hours. You'll receive an email once it's approved.
          </p>
          <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
            <Spinner animation="border" size="sm" variant="primary" />
            <span className="text-muted" style={{ fontSize: '14px' }}>
              Estimated approval time: 24–48 hours
            </span>
          </div>
          <div className="d-grid gap-2">
            <Button variant="primary" className="d-flex align-items-center justify-content-center gap-2">
              <FaSyncAlt /> Refresh Status
            </Button>
            <Link to="/" className="btn btn-outline-secondary">
              Return to Home
            </Link>
          </div>
        </div>

        <p className="text-center text-muted mt-4 mb-1" style={{ fontSize: '13px' }}>
          Have questions about your application?{' '}
          <a href="#support" className="text-decoration-none text-primary">
            Contact our support team
          </a>
        </p>

        <p className="text-center text-muted" style={{ fontSize: '12px' }}>
          © 2025 Apna Mestri. All rights reserved.
        </p>
      </div>
    </Container>
  );
}

export default AdminApprovalPending;
