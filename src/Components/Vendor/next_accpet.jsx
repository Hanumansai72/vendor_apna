import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import API_BASE_URL from "../../config";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";
import "./Techincal.css";

const WEATHER_API_KEY = "be12bfe18a5e6692622153268ca9e7b3";

const JobInProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendorId = localStorage.getItem("JObid");

  const [job, setJob] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifying, setVerifying] = useState(false);

  // Fetch Job
  useEffect(() => {
    if (!vendorId) {
      setLoading(false);
      return;
    }
    axios
      .get(`${API_BASE_URL}/services/jobs/${vendorId}`)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data.find((j) => j._id === id || j.jobId === id) || res.data[0]
          : res.data;
        setJob(data || null);
      })
      .catch((e) => console.error("Job fetch error:", e))
      .finally(() => setLoading(false));
  }, [vendorId, id]);

  // Live Weather
  useEffect(() => {
    const lat = job?.address?.latitude;
    const lon = job?.address?.longitude;
    if (!lat || !lon) return;

    axios
      .get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`)
      .then((r) => {
        const d = r.data;
        setWeather({
          temp: Math.round(d.main?.temp ?? 0),
          description: d.weather?.[0]?.description ?? "—",
          icon: d.weather?.[0]?.icon,
        });
      })
      .catch(console.error);
  }, [job]);

  const formattedDate = useMemo(() => {
    if (!job?.serviceDate) return "—";
    return new Date(job.serviceDate).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }, [job?.serviceDate]);

  const lat = job?.address?.latitude ?? "";
  const lon = job?.address?.longitude ?? "";

  // OTP
  const openOtp = async () => {
    setShowOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/sendotp`, { Email: job?.customer?.email });
    } catch {
      console.error("Failed to send OTP");
    }
  };

  const handleOtpChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < otp.length - 1) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/verifyotp`, {
        Email: job?.customer?.email,
        otp: otp.join(""),
      });
      if (res.status === 200) {
        setShowOtp(false);
        navigate(`/vendor/${id}/job/progress/reached`);
      }
    } catch {
      alert("Invalid OTP, please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const callCustomer = () => {
    const phone = job?.customer?.phone;
    phone ? (window.location.href = `tel:${phone}`) : alert("Phone not available");
  };

  const getDirections = () => {
    if (!lat || !lon) return alert("Location not available");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`, "_blank");
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="job-progress-page">
          <div className="container-xl py-5 text-center">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="mt-3 text-muted">Loading job details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="job-progress-page">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="progress-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header-info">
              <span className="job-id">Job #{job?._id?.slice(-6) || "—"}</span>
              <h1 className="page-title">Active Job</h1>
              <p className="page-subtitle">{job?.category || "Service"} Request</p>
            </div>
            <div className="header-status">
              <span className="status-badge active">
                <span className="status-dot"></span>
                In Progress
              </span>
            </div>
          </motion.div>

          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-8">
              {/* Map Card */}
              <motion.div
                className="map-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="map-header">
                  <div>
                    <h5><i className="bi bi-geo-alt-fill me-2"></i>Navigation</h5>
                    <p>Route to customer location</p>
                  </div>
                  <button className="btn-directions" onClick={getDirections}>
                    <i className="bi bi-compass me-2"></i>Get Directions
                  </button>
                </div>
                <div className="map-container">
                  {lat && lon ? (
                    <iframe
                      title="map"
                      src={`https://www.google.com/maps?q=${lat},${lon}&hl=en&z=15&output=embed`}
                      loading="lazy"
                      allowFullScreen
                    />
                  ) : (
                    <div className="map-placeholder">
                      <i className="bi bi-map"></i>
                      <p>Location not available</p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Customer Card */}
              <motion.div
                className="customer-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="card-header-custom">
                  <h5><i className="bi bi-person-fill me-2"></i>Customer Details</h5>
                </div>
                <div className="customer-content">
                  <div className="customer-main">
                    <div className="customer-avatar">
                      {(job?.customer?.fullName || "C")[0].toUpperCase()}
                    </div>
                    <div className="customer-info">
                      <h4>{job?.customer?.fullName || "Customer"}</h4>
                      <p><i className="bi bi-envelope me-2"></i>{job?.customer?.email || "—"}</p>
                      <p><i className="bi bi-telephone me-2"></i>{job?.customer?.phone || "—"}</p>
                    </div>
                  </div>
                  <div className="customer-actions">
                    <button className="btn-call" onClick={callCustomer}>
                      <i className="bi bi-telephone-fill"></i>
                      Call
                    </button>
                    <button className="btn-message">
                      <i className="bi bi-chat-dots-fill"></i>
                      Message
                    </button>
                  </div>
                </div>
                <div className="address-section">
                  <h6><i className="bi bi-house me-2"></i>Service Address</h6>
                  <p>{job?.address?.street || "—"}, {job?.address?.city || "—"}</p>
                </div>
              </motion.div>
            </div>

            {/* Right Column */}
            <div className="col-lg-4">
              {/* Schedule Card */}
              <motion.div
                className="schedule-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h5><i className="bi bi-calendar3 me-2"></i>Schedule</h5>
                <div className="schedule-item">
                  <span className="schedule-label">Date</span>
                  <span className="schedule-value">{formattedDate}</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-label">Time</span>
                  <span className="schedule-value">{job?.serviceTime || "TBD"}</span>
                </div>
                <div className="schedule-item">
                  <span className="schedule-label">Duration</span>
                  <span className="schedule-value">~2 hours</span>
                </div>
              </motion.div>

              {/* Payment Card */}
              <motion.div
                className="payment-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h5><i className="bi bi-wallet2 me-2"></i>Payment</h5>
                <div className="payment-amount">
                  ₹{job?.payment?.amount || job?.totalAmount || 0}
                </div>
                <div className="payment-status">
                  <span className={`status ${job?.payment?.status === "Paid" ? "paid" : "pending"}`}>
                    {job?.payment?.status || "Pending"}
                  </span>
                </div>
              </motion.div>

              {/* Weather Card */}
              {weather && (
                <motion.div
                  className="weather-card"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <div className="weather-header">
                    <h5><i className="bi bi-cloud-sun me-2"></i>Weather</h5>
                    {weather.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                        alt="weather"
                      />
                    )}
                  </div>
                  <div className="weather-temp">{weather.temp}°C</div>
                  <div className="weather-desc">{weather.description}</div>
                </motion.div>
              )}

              {/* Action Card */}
              <motion.div
                className="action-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button className="btn-start-job" onClick={openOtp}>
                  <i className="bi bi-play-fill me-2"></i>
                  Arrived - Verify OTP
                </button>
                <Link to={`/vendor/${id}`} className="btn-cancel-job">
                  Cancel Job
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {showOtp && (
          <motion.div
            className="otp-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowOtp(false)}
          >
            <motion.div
              className="otp-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="otp-header">
                <h4>Verify Arrival</h4>
                <p>Enter the OTP sent to customer's email</p>
              </div>
              <form onSubmit={verifyOtp}>
                <div className="otp-inputs">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      value={d}
                      maxLength={1}
                      onChange={(e) => handleOtpChange(e, i)}
                      className="otp-input"
                    />
                  ))}
                </div>
                <button type="submit" className="btn-verify" disabled={verifying}>
                  {verifying ? "Verifying..." : "Verify OTP"}
                </button>
                <button type="button" className="btn-resend" onClick={openOtp}>
                  Resend OTP
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .job-progress-page {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .job-id {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          background: var(--primary-light, #FFF8E6);
          color: var(--primary-dark, #E6C200);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .header-info .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }

        .header-info .page-subtitle {
          color: var(--text-muted, #9ca3af);
          margin: 0;
        }

        .status-badge.active {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #dcfce7;
          color: #166534;
          border-radius: 20px;
          font-weight: 600;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Map Card */
        .map-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .map-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .map-header h5 {
          font-weight: 600;
          margin: 0;
        }

        .map-header p {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin: 0;
        }

        .btn-directions {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: var(--primary, #FFD600);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-directions:hover {
          transform: translateY(-2px);
        }

        .map-container {
          height: 280px;
        }

        .map-container iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .map-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--bg-subtle, #f3f4f6);
          color: var(--text-muted, #9ca3af);
        }

        .map-placeholder i {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }

        /* Customer Card */
        .customer-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
        }

        .card-header-custom {
          padding: 1.25rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .card-header-custom h5 {
          font-weight: 600;
          margin: 0;
        }

        .customer-content {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .customer-main {
          display: flex;
          gap: 1rem;
        }

        .customer-avatar {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .customer-info h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .customer-info p {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin: 0.25rem 0;
        }

        .customer-actions {
          display: flex;
          gap: 0.5rem;
        }

        .btn-call, .btn-message {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-call {
          background: #22c55e;
          color: white;
        }

        .btn-message {
          background: var(--bg-subtle, #f3f4f6);
          color: var(--text-primary, #111827);
        }

        .address-section {
          padding: 1.25rem;
          background: var(--bg-subtle, #f3f4f6);
        }

        .address-section h6 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0 0 0.5rem;
        }

        .address-section p {
          margin: 0;
          color: var(--text-secondary, #4b5563);
        }

        /* Right Column Cards */
        .schedule-card, .payment-card, .weather-card, .action-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .schedule-card h5, .payment-card h5, .weather-card h5 {
          font-weight: 600;
          margin: 0 0 1rem;
          font-size: 0.95rem;
        }

        .schedule-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px dashed var(--border, #e5e7eb);
        }

        .schedule-item:last-child {
          border-bottom: none;
        }

        .schedule-label {
          color: var(--text-muted, #9ca3af);
          font-size: 0.85rem;
        }

        .schedule-value {
          font-weight: 600;
          color: var(--text-primary, #111827);
        }

        .payment-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #22c55e;
          margin-bottom: 0.5rem;
        }

        .payment-status .status {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .payment-status .status.paid {
          background: #dcfce7;
          color: #166534;
        }

        .payment-status .status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .weather-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .weather-header img {
          width: 50px;
          height: 50px;
        }

        .weather-temp {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary, #111827);
        }

        .weather-desc {
          text-transform: capitalize;
          color: var(--text-muted, #9ca3af);
        }

        .btn-start-job {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-start-job:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        .btn-cancel-job {
          display: block;
          text-align: center;
          margin-top: 0.75rem;
          color: var(--text-muted, #9ca3af);
          text-decoration: none;
          font-size: 0.9rem;
        }

        .btn-cancel-job:hover {
          color: #ef4444;
        }

        /* OTP Modal */
        .otp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
          padding: 1rem;
        }

        .otp-modal {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }

        .otp-header h4 {
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .otp-header p {
          color: var(--text-muted, #9ca3af);
          margin: 0 0 1.5rem;
        }

        .otp-inputs {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .otp-input {
          width: 50px;
          height: 60px;
          border: 2px solid var(--border, #e5e7eb);
          border-radius: 12px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 700;
          transition: all 0.2s ease;
        }

        .otp-input:focus {
          outline: none;
          border-color: var(--primary, #FFD600);
          box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.2);
        }

        .btn-verify {
          width: 100%;
          padding: 1rem;
          background: var(--primary, #FFD600);
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
          margin-bottom: 0.75rem;
        }

        .btn-verify:disabled {
          opacity: 0.7;
        }

        .btn-resend {
          background: transparent;
          border: none;
          color: var(--text-muted, #9ca3af);
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-resend:hover {
          color: var(--primary-dark, #E6C200);
        }

        @media (max-width: 768px) {
          .customer-content {
            flex-direction: column;
          }

          .customer-actions {
            width: 100%;
          }

          .btn-call, .btn-message {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default JobInProgress;
