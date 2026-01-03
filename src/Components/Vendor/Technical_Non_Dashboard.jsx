import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import axios from "axios";
import API_BASE_URL from "../../config";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Techincal.css";
import Footer from "../Navbar/footer";

const TechnicalNonDashboard = () => {
  const { id } = useParams();
  const [count, setCount] = useState({});
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [newJobAlert, setNewJobAlert] = useState(null);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [works, setWorks] = useState([]); // ✅ holds upcoming work dates + times
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [analytics, setAnalytics] = useState({
    acceptanceRate: 0,
    completionRate: 0,
    avgResponseTime: 0,
    avgRating: 0,
    earningsGrowth: 0,
  });


  // Helper: Month name & year for header
  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // 🟡 Fetch count, upcoming jobs & upcoming works
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/count/service/${id}`)
      .then((res) => setCount(res.data))
      .catch(console.error);

    axios
      .get(`${API_BASE_URL}/upcomingworks/${id}`)
      .then((res) => setWorks(res.data.show_works || [])) // ✅ includes time
      .catch(console.error);

    axios
      .get(`${API_BASE_URL}/upcomingjobs/${id}`)
      .then((res) => {
        setUpcomingJobs(res.data || []);
        if (res.data && res.data.length > 0) {
          setNewJobAlert(res.data[0]);
          setShowJobPopup(true);
        }
      })
      .catch(console.error);
  }, [id]);
  useEffect(() => {
    axios.get(`${API_BASE_URL}/vendor/${id}/analytics`)
      .then(res => setAnalytics(res.data))
      .catch(console.error);
  }, [id]);


  // Auto-hide job popup
  useEffect(() => {
    if (showJobPopup) {
      const timer = setTimeout(() => setShowJobPopup(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [showJobPopup]);

  // 🧮 Generate days for calendar
  const generateCalendarDays = (monthDate) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let startDay = firstDay.getDay();

    const calendar = [];
    let week = new Array(7).fill("");
    for (let i = 0; i < startDay; i++) week[i] = "";

    for (let day = 1; day <= lastDay.getDate(); day++) {
      week[startDay] = day;
      if (startDay === 6 || day === lastDay.getDate()) {
        calendar.push(week);
        week = new Array(7).fill("");
      }
      startDay = (startDay + 1) % 7;
    }

    return calendar;
  };

  const calendarDays = generateCalendarDays(currentMonth);

  // Month navigation
  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  // 🟣 Check if day has work
  const findWorkForDate = (day) => {
    if (!day) return [];
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    return works.filter((w) => w.date === date); // ✅ support multiple works per day
  };

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
              {count?.count1 || 0} Active Alerts Today
            </h5>
          </div>

          <div className="d-flex flex-wrap justify-content-between mt-4 gap-3">
            {[
              { label: "New Today", value: count.count1, icon: "bi-bell-fill" },
              { label: "Completed", value: count.count2, icon: "bi-check2-all" },
              { label: "Earnings", value: count.count3, icon: "bi-currency-rupee" },
            ].map((stat, i) => (
              <div
                key={i}
                className="stat-card flex-fill text-center p-4 rounded-3 bg-light shadow-sm"
              >
                <i className={`bi ${stat.icon} fs-3 text-dark`}></i>
                <h4 className="fw-bold mt-2">{stat.value || 0}</h4>
                <p className="text-dark mb-0 fw-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Upcoming Schedule Calendar ===== */}
        <motion.div
          className="p-4 rounded-4 shadow-sm bg-white mb-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h4 className="fw-bold mb-0">Upcoming Schedule</h4>
            <div className="d-flex align-items-center gap-3">
              <button
                className="btn btn-light rounded-circle shadow-sm"
                onClick={handlePrevMonth}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <h6 className="fw-semibold mb-0">{monthName}</h6>
              <button
                className="btn btn-light rounded-circle shadow-sm"
                onClick={handleNextMonth}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="calendar-header row text-center fw-semibold text-secondary">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
              <div className="col calendar-cell py-2" key={i}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="calendar-body">
            {calendarDays.map((week, i) => (
              <div className="row text-center" key={i}>
                {week.map((day, j) => {
                  const matchingWorks = findWorkForDate(day);
                  return (
                    <div
                      className={`col calendar-cell p-3 ${matchingWorks.length
                        ? "bg-warning-subtle text-dark rounded-3 fw-bold shadow-sm"
                        : ""
                        }`}
                      key={j}
                    >
                      <div>{day}</div>
                      {matchingWorks.map((work, idx) => (
                        <div
                          key={idx}
                          className="small text-muted mt-1 fw-normal"
                        >
                          <i className="bi bi-clock me-1"></i>
                          {work.time}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Recent Job Alerts ===== */}
        <div className="p-4 rounded-4 shadow-sm bg-white mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
            <h4 className="fw-bold mb-0 text-dark">Recent Job Alerts</h4>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary d-flex align-items-center">
                <i className="bi bi-funnel me-2"></i>Filter
              </button>
              <button className="btn btn-outline-secondary d-flex align-items-center">
                <i className="bi bi-download me-2"></i>Export
              </button>
            </div>
          </div>

          {upcomingJobs.length > 0 ? (
            upcomingJobs.map((job, i) => (
              <div
                key={i}
                className="p-4 mb-3 rounded-4 shadow-sm border border-light bg-light-subtle d-flex justify-content-between align-items-start flex-wrap"
              >
                <div className="d-flex align-items-start flex-wrap">
                  <div
                    className="rounded-circle bg-white d-flex align-items-center justify-content-center me-3 shadow-sm"
                    style={{ width: 50, height: 50 }}
                  >
                    <i className="bi bi-tools text-warning fs-4"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-1">
                      {job.Vendorid?.Category || "General Service"}
                    </h5>
                    <p className="text-muted mb-1 small">
                      <i className="bi bi-person-fill me-1 text-secondary"></i>
                      {job.customerid?.fullName || "Customer"} •{" "}
                      <i className="bi bi-geo-alt-fill me-1 text-secondary"></i>
                      {job.address?.city || "Location not available"}
                    </p>
                    <p className="text-dark mb-1 small fw-semibold">
                      <i className="bi bi-calendar-event me-2 text-warning"></i>
                      {new Date(job.serviceDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      • {job.serviceTime || "N/A"}
                    </p>
                    <p className="text-muted small mb-2">
                      {job.description ||
                        "Scheduled maintenance or urgent task — details not provided."}
                    </p>
                    <div className="d-flex gap-2 mt-2">
                      <span className="badge bg-success-subtle text-success">
                        Upcoming
                      </span>
                      <span className="badge bg-warning-subtle text-dark">
                        ₹{job.totalAmount || 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 mt-md-0">
                  <button
                    className="btn btn-warning text-dark fw-semibold px-4 rounded-pill shadow-sm"
                    onClick={() => alert(`Viewing details for job ID: ${job._id}`)}
                  >
                    View Details <i className="bi bi-arrow-right-short ms-1"></i>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-info-circle me-2"></i>
              No recent job alerts available.
            </div>
          )}
        </div>

        {/* ===== Analytics Section ===== */}
        <div className="p-4 rounded-4 shadow-sm bg-white mb-5">
          <h4 className="fw-bold mb-4">Alert Performance Analytics</h4>
          <div className="row g-3">
            <div className="col-6 col-lg">
              <div className="stat-box rounded-4 p-3">
                <h5 className="fw-bold text-success mb-1">{analytics.acceptanceRate?.toFixed(1)}%</h5>
                <p className="text-muted small mb-0">Acceptance Rate</p>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="stat-box rounded-4 p-3">
                <h5 className="fw-bold text-warning mb-1">{analytics.completionRate?.toFixed(1)}%</h5>
                <p className="text-muted small mb-0">Completion Rate</p>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="stat-box rounded-4 p-3">
                <h5 className="fw-bold text-primary mb-1">{analytics.avgResponseTime} min</h5>
                <p className="text-muted small mb-0">Avg Response</p>
              </div>
            </div>
            <div className="col-6 col-lg">
              <div className="stat-box rounded-4 p-3">
                <h5 className="fw-bold text-info mb-1">{analytics.avgRating}★</h5>
                <p className="text-muted small mb-0">Customer Rating</p>
              </div>
            </div>
            <div className="col-12 col-lg">
              <div className="stat-box rounded-4 p-3">
                <h5 className="fw-bold text-success mb-1">{analytics.earningsGrowth?.toFixed(1)}%</h5>
                <p className="text-muted small mb-0">Earnings Growth</p>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Support & Help ===== */}
        <motion.div
          className="p-4 rounded-4 shadow-sm bg-white mb-5 support-container"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h4 className="fw-bold mb-4">Support & Help</h4>

          <div className="row g-4">
            {/* FAQ */}
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
                <a href="#" className="fw-semibold text-primary text-decoration-none">
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
                <a href="#" className="fw-semibold text-success text-decoration-none">
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
                <a href="#" className="fw-semibold text-purple text-decoration-none">
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
              <a
                href="tel:+917093832122"
                className="btn btn-warning fw-semibold d-flex align-items-center rounded-3 px-4"
              >
                <i className="bi bi-telephone-fill me-2"></i> Call Now
              </a>

              <a
                href="https://wa.me/917093832122"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-dark fw-semibold d-flex align-items-center rounded-3 px-4"
              >
                <i className="bi bi-whatsapp me-2"></i> Live Chat
              </a>

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
      <Footer></Footer>
    </>
  );
};

export default TechnicalNonDashboard;
