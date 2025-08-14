import React, { useState, useEffect } from 'react';
import { Button, Form, Pagination, Row, Col, Badge, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import axios from 'axios';

const statusVariant = {
  Pending: 'secondary',
  Accepted: 'success',
  'In Progress': 'warning',
  Completed: 'primary',
};

const actionButton = {
  Pending: { label: 'Accept Job', variant: 'warning' },
  Accepted: { label: 'Start Job', variant: 'primary' },
  // Removed 'In Progress' and 'Completed' buttons
};

const JobListings = () => {
  const vendorId = localStorage.getItem("vendorId");
  const [jobs, setJobs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const navigate = useNavigate();
  const jobsPerPage = 4;

  useEffect(() => {
    axios.get(`https://backend-d6mx.vercel.app/api/newjob/${vendorId}`)
      .then(res => setJobs(res.data))
      .catch(err => console.error('Error fetching jobs:', err));
  }, [vendorId]);

 const handleActionClick = async (jobId, newStatus) => {
  try {
    const res = await axios.put(`https://backend-d6mx.vercel.app/api/bookings/${jobId}/status`, {
      status: newStatus,
    });

    const updatedJobs = jobs.map(job =>
      job._id === jobId ? { ...job, status: res.data.status } : job
    );
    localStorage.setItem("JObid",jobId)

    setJobs(updatedJobs);

    if (newStatus === 'In Progress') {
      navigate(`/vendor/${vendorId}/Job/Progress`);
    }
  } catch (err) {
    console.error('Status update failed:', err);
  }
};

  const filteredJobs = jobs.filter(job => {
    const matchesSearch =
      job.customer?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.address?.city?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? job.status === statusFilter : true;
    const matchesLocation = locationFilter ? job.address?.city === locationFilter : true;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;
  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  

  return (
    <div>
      <Navbar />

      <div className="container my-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4>Job Listings</h4>
          <div>
            <Button variant="outline-secondary" className="me-2">Export</Button>
            <Button variant="warning">+ New Job</Button>
          </div>
        </div>

        <div className="d-flex gap-2 mb-3">
          <Form.Control
            placeholder="Search jobs by customer, location, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </Form.Select>
          <Form.Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)}>
            <option value="">All Locations</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="Phoenix">Phoenix</option>
            <option value="Los Angeles">Los Angeles</option>
            <option value="Chicago">Chicago</option>
            <option value="New York">New York</option>
          </Form.Select>
        </div>

        {currentJobs.length > 0 ? currentJobs.map(job => (
          <Card key={job._id} className="mb-3 shadow-sm">
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h5>{job.service}</h5>
                  <p className="text-muted mb-1">{job.customer?.fullName} • {job.address?.city}</p>
                  <Row>
                    <Col md={4}>
                      <strong>Service Type:</strong>
                      <div>{job.service}</div>
                    </Col>
                    <Col md={4}>
                      <strong>Scheduled Date & Time:</strong>
                      <div>{new Date(job.serviceDate).toLocaleDateString()} • {job.serviceTime}</div>
                    </Col>
                    <Col md={4}>
                      <strong>Total Amount:</strong>
                      <div>₹ {job.totalAmount}</div>
                    </Col>
                  </Row>
                </Col>

                <Col md={4} className="text-md-end mt-3 mt-md-0">
                  <Badge bg={statusVariant[job.status]} className="mb-3">{job.status}</Badge>
                  <div className="d-flex flex-wrap gap-2 justify-content-md-end">
                    {['Pending', 'Accepted'].includes(job.status) && (
  <Button
    variant={actionButton[job.status].variant}
    onClick={() =>
      handleActionClick(
        job._id,
        job.status === 'Pending' ? 'Accepted' : 'In Progress'
      )
    }
  >
    {actionButton[job.status].label}
  </Button>
)}


                    <Button variant="outline-secondary">Call</Button>
                    <Button variant="outline-secondary">Email</Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )) : <p>No jobs found.</p>}

        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small>
              Showing {indexOfFirstJob + 1}-{Math.min(indexOfLastJob, filteredJobs.length)} of {filteredJobs.length} jobs
            </small>
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(1)} />
              <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} />
              <Pagination.Last onClick={() => handlePageChange(totalPages)} />
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobListings;
