import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import axios from 'axios';

const JobInProgress = () => {
  const address = "medipally";

  const currentStep = 2;
  const isStepActive = (step) => step <= currentStep;

  const price = "$120.00";

  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  const [jobs, setJobs] = useState([]);
  const vendorId = localStorage.getItem("JObid");

  useEffect(() => {
    axios.get(`https://backend-d6mx.vercel.app/services/jobs/${vendorId}`)
      .then(res => {
        console.log(res.data);
        setJobs(res.data);
      })
      .catch(err => console.error('Error fetching jobs:', err));
  }, [vendorId]);

  const handleOtpChange = (e, index) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode === '1234') {
      setIsOtpVerified(true);
      alert('OTP Verified. Job marked as Reached.');
      setShowModal(false);
      navigate(`/vendor/${id}/Job/Progress/reached`);
    } else {
      alert('Invalid OTP, please try again.');
    }
  };


  // Extract location info safely with optional chaining
  const latitude = jobs?.address?.latitude;
  const longitude = jobs?.address?.longitude;
  const location = jobs?.address?.city;
  const fullNames = jobs?.customer?.fullName;

  // Format service date and time
  const serviceDate = jobs?.serviceDate;
  const serviceTime = jobs?.serviceTime;
  const paymentmode=jobs?.payment?.method;        


  const formattedDate = serviceDate
    ? new Date(serviceDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div>
      <Navbar />
      <div className="container my-4">
        <div className="card shadow-sm">
          <div className="card-header bg-primary text-white">Job In Progress</div>
          <div className="card-body">

            {/* Progress Steps */}
            <div className="mb-4">
              <div className="d-flex justify-content-between text-center">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex-fill position-relative">
                    {step !== 1 && (
                      <div style={{
                        height: '2px',
                        background: isStepActive(step) ? '#0d6efd' : '#dee2e6',
                        top: '20px',
                        position: 'absolute',
                        left: 0,
                        right: 0
                      }}></div>
                    )}
                    <div
                      className={`rounded-circle mx-auto mb-2 ${isStepActive(step) ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                      style={{ width: '40px', height: '40px', lineHeight: '40px' }}
                    >
                      {step}
                    </div>
                    <small className={isStepActive(step) ? 'text-primary' : 'text-muted'}>
                      {step === 1 ? 'Accepted' : step === 2 ? 'En Route' : 'Reached'}
                    </small>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="mb-4">
              <div className="position-relative">
                {jobs && (
                  <iframe
                    width="600"
                    height="450"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    className='w-100'
                    src={`https://www.google.com/maps?q=${latitude},${longitude}&hl=en&z=14&output=embed`}
                    title="Location Map"
                  />
                )}

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">2.5 miles away</small>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
            </div>

            {/* Service Info */}
            <div className="mb-3">
              <h5>Service Location</h5>
              <p>{location}</p>
            </div>

            {/* Job Info */}
            <div className="mb-4">
              <h5>Job Details</h5>
              <ul className="list-group">
                <li className="list-group-item">
                  <strong>Customer:</strong> {fullNames} <br />
                </li>
                <li className="list-group-item"><strong>Service Type:</strong> Plumbing - Leak Repair</li>
                <li className="list-group-item">
                  <strong>Scheduled Time:</strong> {formattedDate} - {serviceTime}
                </li>
                <li className="list-group-item"><strong>Job ID:</strong> JOBID-2025-04189</li>
                <li className="list-group-item"><strong>Price:</strong> {price}</li>
                                <li className="list-group-item"><strong>Payment Mode:</strong> {paymentmode}</li>

              </ul>
            </div>

            <div className="alert alert-warning">
              Please park in the guest parking area. The building has a security gate - use code <strong>#49710</strong> to enter. The leak is under the kitchen sink and has been temporarily contained with a bucket.
            </div>

            <div className="alert alert-info">
              <strong>Current Status:</strong> En Route to Customer Location
            </div>

            <div className="text-center">
              <Button variant="warning" size="lg" onClick={handleShowModal}>
                Mark as Reached
              </Button>
            </div>
          </div>
        </div>

        {/* OTP Modal */}
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Verify OTP</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleOtpSubmit}>
              <Form.Group className="mb-3 text-center">
                <div className="d-flex justify-content-center">
                  {otp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      className="otp-input mx-2"
                      style={{ width: '50px', height: '50px', fontSize: '20px', textAlign: 'center' }}
                    />
                  ))}
                </div>
              </Form.Group>
              <Button variant="primary" type="submit" className="w-100">
                Verify OTP
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default JobInProgress;
