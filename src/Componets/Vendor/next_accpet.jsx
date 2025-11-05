import React, { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Vendor/nextaccpet.css";
import { Modal, Button, Form } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import axios from "axios";
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
      .get(`https://backend-d6mx.vercel.app/services/jobs/${vendorId}`)
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

    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${WEATHER_API_KEY}`;
    axios
      .get(url)
      .then((r) => {
        const d = r.data;
        setWeather({
          tempF: Math.round(d.main?.temp ?? 0),
          description: d.weather?.[0]?.description ?? "—",
          precip: d.rain?.["1h"] ? `${d.rain["1h"]} in` : "0% chance",
          wind: `${Math.round(d.wind?.speed ?? 0)} mph ${
            d.wind?.deg ? degToCompass(d.wind.deg) : ""
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
      await axios.post("https://backend-d6mx.vercel.app/sendotp", {
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
        "https://backend-d6mx.vercel.app/verifyotp",
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

  // ✅ New: Open Google Maps navigation
  const getDirections = () => {
    if (!lat || !lon) {
      alert("Location data not available for this job.");
      return;
    }
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
    window.open(mapUrl, "_blank");
  };

  // ---- Anim variants ----
  const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <>
      <Navbar />

      <div className="container my-4">
        {/* ======= Job Details Header ======= */}
        <motion.div
          {...fade}
          transition={{ duration: 0.45 }}
          className="d-flex justify-content-between align-items-start mb-3"
        >
          <div>
            <h2 className="display-6 fw-bold mb-0">Job Details</h2>
            <div className="text-muted">
              Service Request #{job?.jobId || job?._id || "—"}
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge rounded-pill bg-success-subtle text-success-emphasis px-3 py-2">
              <span
                className="me-2 rounded-circle d-inline-block"
                style={{ width: 8, height: 8, background: "#28a745" }}
              />{" "}
              Active Job
            </span>
            <button className="btn btn-light border rounded-circle px-2">⋮</button>
          </div>
        </motion.div>

        {/* ======= Route Navigation Section ======= */}
        <motion.div
          {...fade}
          transition={{ duration: 0.5 }}
          className="route-wrap rounded-4 shadow-sm mb-4"
        >
          <div className="route-header px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              <h5 className="text-white mb-0 fw-bold">Route Navigation</h5>
              <div className="text-white-50">Optimized path to your destination</div>
            </div>
            <div className="badge bg-warning text-dark fw-bold rounded-pill px-3 py-2">
              2.4 mi
            </div>
          </div>

          <div className="position-relative p-3 pt-0">
            <div className="drive-badge shadow-sm">
              <i className="bi bi-signpost-split me-2"></i>8 min drive
            </div>

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
              <div
                className="w-100 rounded-3 shadow-sm bg-light"
                style={{ height: 280 }}
              />
            )}

            {/* ✅ Get Directions Button */}
            <div className="text-center mt-3">
              <button
                className="btn btn-primary rounded-pill px-4 fw-semibold"
                onClick={getDirections}
              >
                <i className="bi bi-geo-alt-fill me-2"></i> Get Directions
              </button>
            </div>

            {/* Floating map tools */}
            <div className="map-fabs">
              <button className="btn btn-white shadow-sm rounded-3">+</button>
              <button className="btn btn-white shadow-sm rounded-3">−</button>
              <button className="btn btn-white shadow-sm rounded-3">
                <i className="bi bi-crosshair"></i>
              </button>
            </div>
          </div>
        </motion.div>

        {/* ======= (Keep rest of UI same: Overview, Schedule, Weather, Emergency, etc.) ======= */}
        {/* ... All your other sections remain unchanged ... */}
      </div>

      {/* ======= Sticky Bottom Action Bar ======= */}
      <div className="sticky-action-bar shadow-lg bg-white py-3 px-4 d-flex justify-content-center align-items-center gap-3 flex-wrap">
        <button
          className="btn btn-secondary rounded-pill px-4"
          onClick={cancelJob}
        >
          <i className="bi bi-x-lg me-2" /> Cancel Job
        </button>
        <button
          className="btn btn-primary rounded-pill px-4"
          onClick={callCustomer}
        >
          <i className="bi bi-telephone-fill me-2" /> Call Customer
        </button>
        <button
          className="btn btn-warning rounded-pill px-4 fw-bold"
          onClick={openOtp}
        >
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
  const arr = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return arr[val % 16];
}

export default JobInProgress;
