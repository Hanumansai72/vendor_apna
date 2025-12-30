import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Vendor/nextaccpet.css";
import { Modal, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import axios from "axios";
import API_BASE_URL from "../../config";
import { motion } from "framer-motion";

const WEATHER_API_KEY = "be12bfe18a5e6692622153268ca9e7b3";

const JobInProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const vendorId = localStorage.getItem("JObid");

  // ---- State ----
  const [job, setJob] = useState(null);
  const [weather, setWeather] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // ---- Fetch Job ----
  useEffect(() => {
    if (!vendorId) return;
    axios
      .get(`${API_BASE_URL}/services/jobs/${vendorId}`)
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data.find((j) => j._id === id || j.jobId === id) || res.data[0]
          : res.data;
        setJob(data || null);
      })
      .catch((e) => console.error("Job fetch error:", e));
  }, [vendorId, id]);

  // ---- Live Weather ----
  useEffect(() => {
    const lat = job?.address?.latitude;
    const lon = job?.address?.longitude;
    if (!lat || !lon || !WEATHER_API_KEY) return;

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_API_KEY}`;
    axios
      .get(url)
      .then((r) => {
        const d = r.data;
        setWeather({
          temp: Math.round(d.main?.temp ?? 0),
          description: d.weather?.[0]?.description ?? "—",
          precip: d.rain?.["1h"] ? `${d.rain["1h"]} mm` : "0%",
          wind: `${Math.round(d.wind?.speed ?? 0)} km/h ${d.wind?.deg ? degToCompass(d.wind.deg) : ""
            }`.trim(),
        });
      })
      .catch((e) => console.error("Weather error:", e));
  }, [job]);

  const formattedDate = useMemo(() => {
    if (!job?.serviceDate) return "—";
    return new Date(job.serviceDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [job?.serviceDate]);

  const serviceTime = job?.serviceTime || job?.time || "—";
  const lat = job?.address?.latitude ?? "";
  const lon = job?.address?.longitude ?? "";

  // ---- OTP ----
  const openOtp = async () => {
    setShowOtp(true);
    try {
      await axios.post(`${API_BASE_URL}/sendotp`, {
        Email: job?.customer?.email,
      });
      alert("OTP sent to customer email!");
    } catch {
      alert("Failed to send OTP");
    }
  };

  const handleOtpChange = (e, i) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 1);
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < otp.length - 1)
      document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_BASE_URL}/verifyotp`,
        {
          Email: job?.customer?.email,
          otp: otp.join(""),
        }
      );
      if (res.status === 200) {
        alert("OTP Verified. Job marked as Reached.");
        setShowOtp(false);
        navigate(`/vendor/${id}/Job/Progress/reached`);
      }
    } catch {
      alert("Invalid OTP, please try again.");
    }
  };

  // ---- Actions ----
  const callCustomer = () => {
    const phone = job?.customer?.phone;
    phone
      ? (window.location.href = `tel:${phone}`)
      : alert("Customer phone not available");
  };

  const cancelJob = () => {
    if (window.confirm("Cancel this job locally?"))
      navigate("/vendor/dashboard");
  };

  // ✅ Open Google Maps
  const getDirections = () => {
    if (!lat || !lon) {
      alert("Location data not available for this job.");
      return;
    }
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
    window.open(mapUrl, "_blank");
  };

  const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <>
      <Navbar />

      <div className="container my-4">
        {/* ======= Job Header ======= */}
        <motion.div {...fade} transition={{ duration: 0.45 }} className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h2 className="display-6 fw-bold mb-0">Job Details</h2>
            <div className="text-muted">Service Request #{job?.jobId || job?._id || "—"}</div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
              <span className="me-2 rounded-circle d-inline-block" style={{ width: 8, height: 8, background: "#28a745" }} /> Active Job
            </span>
          </div>
        </motion.div>

        {/* ======= Route Navigation ======= */}
        <motion.div {...fade} transition={{ duration: 0.5 }} className="route-wrap rounded-4 shadow-sm mb-4">
          <div className="route-header px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="text-white mb-0 fw-bold">Route Navigation</h5>
              <div className="text-white-50">Optimized path to your destination</div>
            </div>
            <div className="badge bg-warning text-dark fw-bold rounded-pill px-3 py-2">2.4 mi</div>
          </div>

          <div className="position-relative p-3 pt-0">
            {lat && lon ? (
              <iframe
                title="map"
                className="w-100 rounded-3 shadow-sm"
                style={{ border: 0, height: 280, background: "#eef9fb" }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps?q=${lat},${lon}&hl=en&z=14&output=embed`}
              />
            ) : (
              <div className="w-100 rounded-3 shadow-sm bg-light" style={{ height: 280 }} />
            )}

            <div className="text-center mt-3">
              <button className="btn btn-primary rounded-pill px-4 fw-semibold" onClick={getDirections}>
                <i className="bi bi-geo-alt-fill me-2"></i> Get Directions
              </button>
            </div>
          </div>
        </motion.div>

        {/* ======= Service Overview ======= */}
        <motion.div {...fade} transition={{ duration: 0.5 }} className="rounded-4 overflow-hidden shadow-sm mb-4">
          <div className="service-head d-flex justify-content-between align-items-center px-4 py-3">
            <div>
              <h5 className="text-white mb-0 fw-bold">Service Overview</h5>
              <div className="text-white-50">Complete job information</div>
            </div>
            <span className="badge bg-warning text-dark fw-bold rounded-pill px-3 py-2">URGENT</span>
          </div>

          <div className="px-4 py-3 bg-white">
            <div className="d-flex gap-3 mb-3 flex-wrap">
              <span className="pill-yellow fw-bold">{job?.category || "PLUMBING"}</span>
              <span className="pill-blue">{job?.serviceType || "Emergency Repair"}</span>
            </div>

            <div className="bg-body-tertiary rounded-4 p-4">
              <h6 className="fw-bold mb-3"><i className="bi bi-person-fill me-2 text-warning"></i>Customer Details</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="text-muted small">Name</div>
                  <div className="fw-semibold">{job?.customer?.fullName || "—"}</div>
                  <div className="mt-3 text-muted small">Email</div>
                  <div className="text-muted">{job?.customer?.email || "—"}</div>
                </div>
                <div className="col-md-6">
                  <div className="text-muted small">Phone</div>
                  <div className="text-primary fw-bold">{job?.customer?.phone || "(—)"}</div>
                  <div className="mt-3 text-muted small">Rating</div>
                  <div className="text-warning">★★★★★ <span className="text-muted">(4.9)</span></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======= Schedule & Compensation ======= */}
        <motion.div {...fade} transition={{ duration: 0.5 }} className="rounded-4 overflow-hidden shadow-sm mb-4">
          <div className="schedule-head px-4 py-3">
            <h5 className="text-white mb-0 fw-bold">Schedule & Compensation</h5>
            <div className="text-white-50">Time and payment details</div>
          </div>

          <div className="px-4 py-4 bg-white">
            <div className="row g-3">
              <div className="col-md-6">
                <div className="p-4 rounded-4 bg-body-tertiary">
                  <div className="fw-semibold"><i className="bi bi-calendar3 me-2 text-primary" />Service Date</div>
                  <div className="fs-3 fw-bold mt-2">{formattedDate}</div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4 rounded-4 bg-body-tertiary">
                  <div className="fw-semibold"><i className="bi bi-clock me-2 text-warning" />Time Window</div>
                  <div className="fs-3 fw-bold mt-2">{serviceTime}</div>
                  <div className="text-muted">Flexible +/- 30 min</div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-4 rounded-4 comp-box">
              <div className="fw-semibold"><i className="bi bi-currency-rupee me-2 text-success" />Estimated Compensation</div>
              <div className="d-flex justify-content-between align-items-center mt-2">
                <div className="text-muted">Base Service Fee</div>
                <div className="fw-bold">₹{job?.payment?.amount || 120}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======= Current Conditions ======= */}
        <motion.div {...fade} transition={{ duration: 0.5 }} className="mb-4">
          <h3 className="text-center fw-bold">Current Conditions</h3>
          <p className="text-center text-muted">Weather and traffic updates for your trip</p>

          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-4 rounded-4 weather-card text-white h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="fw-bold mb-0">Weather Forecast</h5>
                  <i className="bi bi-cloud-sun fs-2 text-white-50" />
                </div>
                <div className="mt-3">
                  <div className="display-6 fw-bold">{weather ? `${weather.temp}°C` : "—"}</div>
                  <div className="fw-semibold text-capitalize">{weather ? weather.description : "—"}</div>
                  <div className="text-white-75 mt-2">Wind: {weather?.wind || "—"}</div>
                  <div className="text-white-75 mt-1">Precipitation: {weather?.precip || "—"}</div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-4 rounded-4 traffic-card text-white h-100">
                <div className="d-flex justify-content-between align-items-start">
                  <h5 className="fw-bold mb-0">Traffic Status</h5>
                  <i className="bi bi-cone-striped fs-2 text-white-50" />
                </div>
                <div className="mt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>Current Traffic</div>
                    <span className="badge bg-light text-success">Light</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div>Expected Travel Time</div>
                    <div className="h4 mb-0">8 min</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ======= Emergency Contacts ======= */}
        <motion.div {...fade} transition={{ duration: 0.5 }} className="mb-5">
          <h3 className="text-center fw-bold">Emergency Contacts</h3>
          <p className="text-center text-muted">Important numbers for urgent situations</p>

          <div className="row g-3">
            {[
              { title: "Dispatch Center", color: "danger", num: "(555) 911-HELP", icon: "bi-telephone-fill" },
              { title: "Technical Support", color: "primary", num: "(555) 123-TECH", icon: "bi-headset" },
              { title: "Supervisor", color: "success", num: "(555) 456-BOSS", icon: "bi-person-workspace" },
            ].map((c, i) => (
              <div className="col-md-4" key={i}>
                <div className="p-4 rounded-4 shadow-sm bg-white h-100">
                  <div className="d-flex align-items-center mb-3">
                    <div className={`contact-icon bg-${c.color}-subtle text-${c.color}`}>
                      <i className={`bi ${c.icon}`} />
                    </div>
                    <div className="ms-3">
                      <div className="fw-bold">{c.title}</div>
                      <div className={`h5 text-${c.color} mb-0`}>{c.num}</div>
                    </div>
                  </div>
                  <button className={`btn btn-${c.color} w-100`}>Call Now</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ======= Sticky Action Bar ======= */}
      <div className="sticky-action-bar shadow-lg bg-white py-3 px-4 d-flex justify-content-center align-items-center gap-3 flex-wrap">
        <button className="btn btn-secondary rounded-pill px-4" onClick={cancelJob}>
          <i className="bi bi-x-lg me-2" /> Cancel Job
        </button>
        <button className="btn btn-primary rounded-pill px-4" onClick={callCustomer}>
          <i className="bi bi-telephone-fill me-2" /> Call Customer
        </button>
        <button className="btn btn-success rounded-pill px-4 fw-bold" onClick={getDirections}>
          <i className="bi bi-geo-alt-fill me-2" /> Get Directions
        </button>
        <button className="btn btn-warning rounded-pill px-4 fw-bold" onClick={openOtp}>
          <i className="bi bi-play-fill me-2" /> Start Job
        </button>
      </div>

      {/* ======= OTP Modal ======= */}
      <Modal show={showOtp} onHide={() => setShowOtp(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Verify OTP</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={verifyOtp}>
            <div className="d-flex justify-content-center mb-3">
              {otp.map((d, i) => (
                <Form.Control
                  key={i}
                  id={`otp-${i}`}
                  value={d}
                  maxLength={1}
                  onChange={(e) => handleOtpChange(e, i)}
                  className="mx-2 text-center"
                  style={{
                    width: 50,
                    height: 50,
                    fontSize: 20,
                    borderRadius: 12,
                  }}
                />
              ))}
            </div>
            <Button type="submit" className="w-100">
              Verify OTP
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

// Helper
function degToCompass(num) {
  const val = Math.floor(num / 22.5 + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[val % 16];
}

export default JobInProgress;
