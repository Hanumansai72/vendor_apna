import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import axios from "axios";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Techincal.css"; // Ensure filename matches exactly

const TechnicalNonDashboard = () => {
  const { id } = useParams();
  const [count, setCount] = useState({});
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [newJobAlert, setNewJobAlert] = useState(null);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [month, setMonth] = useState("March 2024");

  const events = {
    5: { name: "Plumbing", color: "bg-warning-subtle text-dark" },
    7: { name: "Electrical", color: "bg-primary-subtle text-primary" },
    11: { name: "Today", color: "bg-warning text-dark fw-bold" },
    12: { name: "Painting", color: "bg-success-subtle text-success" },
  };

  const days = [
    ["", "", "", 1, 2, 3, ""],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, "", "", ""],
  ];

  // Fetch counts & jobs
  useEffect(() => {
    axios
      .get(`https://backend-d6mx.vercel.app/count/service/${id}`)
      .then((res) => setCount(res.data))
      .catch(console.error);

    axios
      .get(`https://backend-d6mx.vercel.app/upcomingjobs/${id}`)
      .then((res) => {
        setUpcomingJobs(res.data || []);
        if (res.data && res.data.length > 0) {
          const latestJob = res.data[0];
          setNewJobAlert(latestJob);
          setShowJobPopup(true);
        }
      })
      .catch(console.error);
  }, [id]);

  // Auto hide popup after 15 seconds
  useEffect(() => {
    if (showJobPopup) {
      const timer = setTimeout(() => setShowJobPopup(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [showJobPopup]);

  return (
    <>
      <Navbar />

      <div className="container-fluid p-4">
        {/* ===== Job Alert Dashboard ===== */}
        <motion.div
          className="p-4 rounded-4 mb-4 shadow-sm dashboard-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h3 className="fw-bold text-dark">Job Alert Dashboard</h3>
              <p className="text-muted mb-0">
                Stay updated with real-time opportunities
              </p>
            </div>
            <h5 className="fw-bold text-dark">
              {count?.count1 || 23} Active Alerts Today
            </h5>
          </div>

          <div className="d-flex flex-wrap justify-content-between mt-4 gap-3">
            {[
              { label: "New Today", value: 12, icon: "bi-bell-fill" },
              { label: "Viewed", value: 8, icon: "bi-eye-fill" },
              { label: "Applied", value: 5, icon: "bi-handshake-fill" },
              {
                label: "Potential Earnings",
                value: "$2.4K",
                icon: "bi-currency-dollar",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card flex-fill text-center p-4 rounded-3 bg-light shadow-sm"
              >
                <i className={`bi ${stat.icon} fs-3 text-dark`}></i>
                <h4 className="fw-bold mt-2">{stat.value}</h4>
                <p className="text-dark mb-0 fw-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Upcoming Schedule ===== */}
        <motion.div
          className="p-4 rounded-4 shadow-sm bg-white mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 className="fw-bold mb-0">Upcoming Schedule</h4>
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light rounded-circle shadow-sm">
                <i className="bi bi-chevron-left"></i>
              </button>
              <h6 className="fw-semibold mb-0">{month}</h6>
              <button className="btn btn-light rounded-circle shadow-sm">
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendar">
            <div className="calendar-header row text-center fw-semibold text-secondary">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, i) => (
                  <div className="col calendar-cell py-2" key={i}>
                    {day}
                  </div>
                )
              )}
            </div>

            <div className="calendar-body">
              {days.map((week, i) => (
                <div className="row text-center" key={i}>
                  {week.map((day, j) => (
                    <div
                      className={`col calendar-cell p-3 ${
                        events[day] ? "calendar-event" : ""
                      }`}
                      key={j}
                    >
                      {day && (
                        <>
                          <div
                            className={`day-number ${
                              events[day]?.name === "Today" ? "today-box" : ""
                            }`}
                          >
                            {day}
                          </div>
                          {events[day] && (
                            <div
                              className={`badge mt-2 px-3 py-2 rounded-pill ${events[day].color}`}
                            >
                              {events[day].name}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ===== Recent Job Alerts ===== */}
        <div className="p-4 rounded-4 shadow-sm bg-white mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold mb-0">Recent Job Alerts</h4>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary">
                <i className="bi bi-funnel me-2"></i>Filter
              </button>
              <button className="btn btn-outline-secondary">
                <i className="bi bi-download me-2"></i>Export
              </button>
            </div>
          </div>

          {upcomingJobs.length > 0 ? (
            upcomingJobs.slice(0, 3).map((job, i) => (
              <div
                key={i}
                className="p-3 mb-3 rounded-3 shadow-sm d-flex justify-content-between align-items-start alert-card"
              >
                <div>
                  <div className="d-flex align-items-center mb-2">
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center me-3"
                      style={{ width: 45, height: 45 }}
                    >
                      <i className="bi bi-tools text-primary fs-5"></i>
                    </div>
                    <div>
                      <h5 className="fw-bold mb-0">
                        {job.Vendorid?.Category || "Kitchen Sink Repair"}
                      </h5>
                      <div className="d-flex gap-2 mt-1">
                        <span className="badge bg-success-subtle text-success">
                          Applied
                        </span>
                        <span className="badge bg-danger-subtle text-danger">
                          Urgent
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted mb-1">
                    {job.address?.city || "Downtown"} ·{" "}
                    {job.serviceTime || "3:30 PM"} · ₹{job.totalAmount || 0}
                  </p>
                  <small className="text-muted">
                    {job.description ||
                      "Emergency pipe repair needed in downtown area."}
                  </small>
                </div>
                <div>
                  <button className="btn btn-warning text-dark fw-bold">
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted text-center py-4">
              No recent job alerts available.
            </p>
          )}
        </div>

        {/* ===== Analytics Section ===== */}
        <div className="analytics-section p-4 rounded-4 shadow-sm bg-white mb-5">
          <h4 className="fw-bold mb-4">Alert Performance Analytics</h4>
          {/* include previous analytics JSX here */}
        </div>

        {/* ===== Support & Help ===== */}
        <motion.div
          className="p-4 rounded-4 shadow-sm bg-white mb-5 support-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="fw-bold mb-4">Support & Help</h4>

          <div className="row g-4">
            {/* FAQ Card */}
            <div className="col-md-4">
              <div className="support-card h-100 p-4 rounded-4 border">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-wrapper bg-primary-subtle text-primary">
                    <i className="bi bi-question-circle-fill fs-3"></i>
                  </div>
                  <h5 className="fw-bold ms-3 mb-0">FAQ</h5>
                </div>
                <p className="text-muted small">
                  Find answers to commonly asked questions about job alerts and
                  notifications.
                </p>
                <a
                  href="#"
                  className="fw-semibold text-primary text-decoration-none"
                >
                  Browse FAQ <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>

            {/* Live Support */}
            <div className="col-md-4">
              <div className="support-card h-100 p-4 rounded-4 border">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-wrapper bg-success-subtle text-success">
                    <i className="bi bi-headset fs-3"></i>
                  </div>
                  <h5 className="fw-bold ms-3 mb-0">Live Support</h5>
                </div>
                <p className="text-muted small">
                  Get instant help from our support team via live chat or phone.
                </p>
                <a
                  href="#"
                  className="fw-semibold text-success text-decoration-none"
                >
                  Contact Support <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>

            {/* User Guide */}
            <div className="col-md-4">
              <div className="support-card h-100 p-4 rounded-4 border">
                <div className="d-flex align-items-center mb-3">
                  <div className="icon-wrapper bg-purple-subtle text-purple">
                    <i className="bi bi-book-fill fs-3"></i>
                  </div>
                  <h5 className="fw-bold ms-3 mb-0">User Guide</h5>
                </div>
                <p className="text-muted small">
                  Learn how to maximize your earnings with our comprehensive
                  user guide.
                </p>
                <a
                  href="#"
                  className="fw-semibold text-purple text-decoration-none"
                >
                  Read Guide <i className="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="support-footer mt-5 p-4 rounded-4 bg-light d-flex flex-wrap justify-content-between align-items-center">
            <div>
              <h6 className="fw-bold mb-1">Need immediate assistance?</h6>
              <p className="text-muted mb-0 small">
                Our support team is available 24/7 to help you with any urgent
                issues.
              </p>
            </div>
            <div className="d-flex gap-3 mt-3 mt-md-0">
              <button className="btn btn-warning fw-semibold d-flex align-items-center rounded-3 px-4">
                <i className="bi bi-telephone-fill me-2"></i> Call Now
              </button>
              <button className="btn btn-dark fw-semibold d-flex align-items-center rounded-3 px-4">
                <i className="bi bi-chat-dots-fill me-2"></i> Live Chat
              </button>
            </div>
          </div>
        </motion.div>

        {/* ===== New Job Popup ===== */}
        {showJobPopup && newJobAlert && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="position-fixed bottom-0 end-0 m-4 p-4 rounded-4 shadow-lg job-popup bg-white"
          >
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="fw-bold text-warning mb-0">
                  <i className="bi bi-briefcase-fill me-2"></i>New Job Alert!
                </h5>
                <small className="text-muted">High priority match</small>
              </div>
              <button
                className="btn-close"
                onClick={() => setShowJobPopup(false)}
              ></button>
            </div>

            <span className="badge bg-warning-subtle text-dark rounded-pill px-3 py-1 mb-2">
              {newJobAlert.Vendorid?.Category || "Emergency Plumbing"}
            </span>

            <div className="mb-2">
              <i className="bi bi-calendar-event me-2 text-warning"></i>
              {newJobAlert.serviceTime || "Today, 3:30 PM – 5:30 PM"}
            </div>
            <div className="mb-2">
              <i className="bi bi-geo-alt-fill me-2 text-warning"></i>
              {newJobAlert.address?.street || "1247 Oak Street"},{" "}
              {newJobAlert.address?.city || "Downtown District"}
            </div>
            <div className="mb-3">
              <i className="bi bi-signpost-split me-2 text-warning"></i>2.3 miles
              away
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-0 text-dark">
                ₹{newJobAlert.totalAmount || 185}
              </h4>
              <small className="text-muted">Estimated reward</small>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-warning text-white fw-bold flex-fill"
                onClick={() => alert("Viewing job details...")}
              >
                View Job Details
              </button>
              <button
                className="btn btn-outline-secondary flex-fill"
                onClick={() => setShowJobPopup(false)}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};

export default TechnicalNonDashboard;
