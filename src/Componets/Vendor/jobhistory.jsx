import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Form, Row, Col, Pagination, Modal } from 'react-bootstrap';
import Navbar from './navbar';
import './jobhistory.css';
import axios from 'axios';

const getStatusBadge = (status) => {
  switch (status) {
    case 'Completed':
      return <Badge bg="success">Completed</Badge>;
    case 'In Progress':
      return <Badge bg="info">In Progress</Badge>;
    case 'Cancelled':
      return <Badge bg="danger">Cancelled</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
};

const getStars = (rating) => {
  if (rating == null) return <span className="text-muted">Pending</span>;
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  return (
    <div className="rating">
      {Array.from({ length: fullStars }, (_, i) => (
        <span key={i}>⭐</span>
      ))}
      {halfStar && <span>⭐</span>}
      <span className="ms-2">{rating.toFixed(1)}</span>
    </div>
  );
};

const JobHistory = () => {
  const [allJobs, setAllJobs] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [clientFilter, setClientFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Last 30 days');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // New modal-related state
  const [showModal, setShowModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const jobsPerPage = 5;

  const vendorId = localStorage.getItem('vendorId'); // Adjust if using context or props

  useEffect(() => {
    const fetchCompletedJobs = async () => {
      try {
        const response = await axios.get(`https://backend-d6mx.vercel.app/jobhistry/${vendorId}`);
        setAllJobs(response.data);
      } catch (error) {
        console.error("Error fetching job history:", error);
      }
    };

    if (vendorId) {
      fetchCompletedJobs();
    }
  }, [vendorId]);

  const filteredJobs = allJobs.filter((job) => {
    const matchesStatus = statusFilter === 'All' || job.status === statusFilter;
    const matchesClient = clientFilter === 'All' || job.customer?.fullName === clientFilter;
    const matchesSearch =
      job._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.customer?.fullName.toLowerCase().includes(searchTerm.toLowerCase());

    const jobDate = new Date(job.serviceDate);
    const now = new Date();
    let matchesDate = true;
    if (dateFilter === 'Last 30 days') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchesDate = jobDate >= thirtyDaysAgo;
    } else if (dateFilter === 'Last 7 days') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      matchesDate = jobDate >= sevenDaysAgo;
    } else if (dateFilter === 'This Year') {
      matchesDate = jobDate.getFullYear() === now.getFullYear();
    }

    return matchesStatus && matchesClient && matchesDate && matchesSearch;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Open modal and set selected job
  const handleShowDetails = (job) => {
    setSelectedJob(job);
    setShowModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedJob(null);
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Job History</h4>
          <Button variant="outline-secondary">📥 Export</Button>
        </div>

        <Row className="mb-3">
          <Col md={3}>
            <Form.Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
              <option>Last 30 days</option>
              <option>Last 7 days</option>
              <option>This Year</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Completed</option>
              <option>In Progress</option>
              <option>Cancelled</option>
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
              <option>All</option>
              {[...new Set(allJobs.map(job => job.customer?.fullName))].map((client, idx) => (
                <option key={idx}>{client}</option>
              ))}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Control
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>

        <Table responsive bordered hover className="job-table">
          <thead className="table-light">
            <tr>
              <th>Job ID</th>
              <th>Client</th>
              <th>Service Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Rating</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentJobs.length > 0 ? currentJobs.map((job, index) => (
              <tr key={index}>
                <td><a href="/" className='ID_job'>{job._id}</a></td>
                <td>{job.customer?.fullName || 'N/A'}</td>
                <td>{new Date(job.serviceDate).toLocaleDateString()}</td>
                <td>{job.serviceTime}</td>
                <td>{getStatusBadge(job.status)}</td>
                <td>{getStars(job.rating || null)}</td>
                <td>₹{job.totalAmount.toFixed(2)}</td>
                <td>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => handleShowDetails(job)}
                  >
                    📋
                  </Button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center">No jobs found</td>
              </tr>
            )}
          </tbody>
        </Table>

        <Pagination className="justify-content-end">
          <Pagination.First onClick={() => paginate(1)} disabled={currentPage === 1} />
          <Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />
          {[...Array(totalPages).keys()].map((num) => (
            <Pagination.Item key={num} active={currentPage === num + 1} onClick={() => paginate(num + 1)}>
              {num + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} />
          <Pagination.Last onClick={() => paginate(totalPages)} disabled={currentPage === totalPages} />
        </Pagination>
      </div>

      {/* Modal for Job Details */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Job Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob ? (
            <>
              <h5>Job ID: {selectedJob._id}</h5>
              <p><strong>Client Name:</strong> {selectedJob.customer?.fullName || 'N/A'}</p>
              <p><strong>Phone:</strong> {selectedJob.customer?.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {selectedJob.customer?.email || 'N/A'}</p>
              <p><strong>Service Date:</strong> {new Date(selectedJob.serviceDate).toLocaleDateString()}</p>
              <p><strong>Service Time:</strong> {selectedJob.serviceTime}</p>
              <p><strong>Status:</strong> {getStatusBadge(selectedJob.status)}</p>
              <p><strong>Rating:</strong> {getStars(selectedJob.rating || null)}</p>
              <p><strong>Total Amount:</strong> ₹{selectedJob.totalAmount.toFixed(2)}</p>
              <p><strong>Address:</strong> {selectedJob.customer?.address || 'N/A'}</p>
              {/* Add any other fields you want here */}
            </>
          ) : (
            <p>Loading details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default JobHistory;
