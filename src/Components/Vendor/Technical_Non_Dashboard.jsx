import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Navbar/navbar";
import { api } from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Techincal.css";
import Footer from "../Navbar/footer";

const TechnicalNonDashboard = () => {
  const { id } = useParams();
  const [count, setCount] = useState({});
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [newJobAlert, setNewJobAlert] = useState(null);
  const [showJobPopup, setShowJobPopup] = useState(false);
  const [works, setWorks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [analytics, setAnalytics] = useState({
    acceptanceRate: 0,
    completionRate: 0,
    avgResponseTime: 0,
    avgRating: 0,
    earningsGrowth: 0,
  });

  const monthName = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  // Data fetching
  useEffect(() => {
    api.get(`/count/service/${id}`)
      .then((res) => setCount(res.data))
      .catch(console.error);

    api.get(`/upcomingworks/${id}`)
      .then((res) => setWorks(res.data.show_works || []))
      .catch(console.error);

    api.get(`/upcomingjobs/${id}`)
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
    api.get(`/vendor/${id}/analytics`)
      .then((res) => setAnalytics(res.data))
      .catch(console.error);
  }, [id]);

  useEffect(() => {
    if (showJobPopup) {
      const timer = setTimeout(() => setShowJobPopup(false), 15000);
      return () => clearTimeout(timer);
    }
  }, [showJobPopup]);

  // Calendar logic
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
  const today = new Date();
  const isToday = (day) =>
    day && today.getDate() === day &&
    today.getMonth() === currentMonth.getMonth() &&
    today.getFullYear() === currentMonth.getFullYear();

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
    return works.filter((w) => w.date === date);
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-wrapper">
        <div className="container-xl py-4">
          {/* ===== Welcome Header ===== */}
          <motion.div
            className="welcome-section mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h1 className="welcome-title">
                  Welcome back! <span className="wave">👋</span>
                </h1>
                <p className="welcome-subtitle">
                  Here's your dashboard overview. Stay updated with your jobs and earnings.
                </p>
              </div>
              <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                <span className="today-date">
                  <i className="bi bi-calendar3 me-2"></i>
                  {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
          </motion.div>

          {/* ===== Stats Cards ===== */}
          <motion.div
            className="row g-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {[
              { label: "Active Jobs", value: count.count1 || 0, icon: "bi-briefcase-fill", color: "warning", trend: "+3 today" },
              { label: "Completed", value: count.count2 || 0, icon: "bi-check-circle-fill", color: "success", trend: "This month" },
              { label: "Total Earnings", value: `₹${count.count3 || 0}`, icon: "bi-wallet2", color: "primary", trend: "+12% growth" },
              { label: "Rating", value: `${analytics.avgRating || 4.5}★`, icon: "bi-star-fill", color: "info", trend: "Avg score" },
            ].map((stat, i) => (
              <div className="col-6 col-lg-3" key={i}>
                <div className="stat-card-modern">
                  <div className={`stat-icon bg-${stat.color}-subtle text-${stat.color}`}>
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">{stat.label}</span>
                    <h3 className="stat-value">{stat.value}</h3>
                    <span className="stat-trend">{stat.trend}</span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="row g-4">
            {/* ===== Left Column - Calendar & Jobs ===== */}
            <div className="col-lg-8">
              {/* Calendar */}
              <motion.div
                className="card-section mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="section-header">
                  <div>
                    <h5 className="section-title">
                      <i className="bi bi-calendar-week me-2 text-warning"></i>
                      Upcoming Schedule
                    </h5>
                    <p className="section-subtitle">Your work calendar for {monthName}</p>
                  </div>
                  <div className="calendar-nav">
                    <button className="nav-btn" onClick={handlePrevMonth}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <span className="current-month">{monthName}</span>
                    <button className="nav-btn" onClick={handleNextMonth}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </div>
                </div>

                <div className="calendar-grid">
                  <div className="calendar-header-row">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                      <div className="calendar-day-name" key={i}>{day}</div>
                    ))}
                  </div>
                  {calendarDays.map((week, i) => (
                    <div className="calendar-week" key={i}>
                      {week.map((day, j) => {
                        const matchingWorks = findWorkForDate(day);
                        const hasWork = matchingWorks.length > 0;
                        return (
                          <div
                            className={`calendar-day ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''} ${hasWork ? 'has-work' : ''}`}
                            key={j}
                          >
                            {day && (
                              <>
                                <span className="day-number">{day}</span>
                                {hasWork && (
                                  <div className="work-indicator">
                                    <span className="work-dot"></span>
                                    <span className="work-time">{matchingWorks[0]?.time}</span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Jobs */}
              <motion.div
                className="card-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="section-header">
                  <div>
                    <h5 className="section-title">
                      <i className="bi bi-lightning-fill me-2 text-warning"></i>
                      Recent Job Alerts
                    </h5>
                    <p className="section-subtitle">Latest opportunities matched for you</p>
                  </div>
                  <Link to={`/vendor/${id}/jobs`} className="btn-view-all">
                    View All <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>

                <div className="jobs-list">
                  {upcomingJobs.length > 0 ? (
                    upcomingJobs.slice(0, 3).map((job, i) => (
                      <div className="job-card" key={i}>
                        <div className="job-icon">
                          <i className="bi bi-tools"></i>
                        </div>
                        <div className="job-info">
                          <h6 className="job-title">{job.Vendorid?.Category || "Service Request"}</h6>
                          <p className="job-meta">
                            <span><i className="bi bi-person"></i> {job.customerid?.fullName || "Customer"}</span>
                            <span><i className="bi bi-geo-alt"></i> {job.address?.city || "N/A"}</span>
                          </p>
                          <p className="job-time">
                            <i className="bi bi-clock"></i>
                            {new Date(job.serviceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} • {job.serviceTime || "TBD"}
                          </p>
                        </div>
                        <div className="job-action">
                          <span className="job-amount">₹{job.totalAmount || 0}</span>
                          <button className="btn-accept">
                            View <i className="bi bi-arrow-right-short"></i>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <i className="bi bi-inbox"></i>
                      <p>No recent job alerts</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ===== Right Column - Analytics & Quick Actions ===== */}
            <div className="col-lg-4">
              {/* Performance */}
              <motion.div
                className="card-section mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h5 className="section-title">
                  <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                  Performance
                </h5>

                <div className="performance-list">
                  <div className="perf-item">
                    <div className="perf-label">
                      <span>Acceptance Rate</span>
                      <span className="perf-value text-success">{analytics.acceptanceRate?.toFixed(0) || 0}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill bg-success" style={{ width: `${analytics.acceptanceRate || 0}%` }}></div>
                    </div>
                  </div>
                  <div className="perf-item">
                    <div className="perf-label">
                      <span>Completion Rate</span>
                      <span className="perf-value text-warning">{analytics.completionRate?.toFixed(0) || 0}%</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill bg-warning" style={{ width: `${analytics.completionRate || 0}%` }}></div>
                    </div>
                  </div>
                  <div className="perf-item">
                    <div className="perf-label">
                      <span>Response Time</span>
                      <span className="perf-value text-primary">{analytics.avgResponseTime || 0} min</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-fill bg-primary" style={{ width: `${Math.min(100, 100 - analytics.avgResponseTime * 5)}%` }}></div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                className="card-section mb-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h5 className="section-title">
                  <i className="bi bi-lightning-charge me-2 text-warning"></i>
                  Quick Actions
                </h5>

                <div className="quick-actions">
                  <Link to={`/vendor/${id}/settings`} className="quick-action-btn">
                    <i className="bi bi-person-gear"></i>
                    <span>Edit Profile</span>
                  </Link>
                  <Link to={`/wallet/${id}`} className="quick-action-btn">
                    <i className="bi bi-wallet2"></i>
                    <span>Wallet</span>
                  </Link>
                  <Link to={`/vendor/projectupload/${id}`} className="quick-action-btn">
                    <i className="bi bi-upload"></i>
                    <span>Upload Project</span>
                  </Link>
                  <Link to={`/vendor/${id}/Job/history`} className="quick-action-btn">
                    <i className="bi bi-clock-history"></i>
                    <span>Job History</span>
                  </Link>
                </div>
              </motion.div>

              {/* Support Card */}
              <motion.div
                className="support-card-compact"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="support-icon">
                  <i className="bi bi-headset"></i>
                </div>
                <h6>Need Help?</h6>
                <p>Our support team is available 24/7</p>
                <a href="https://wa.me/917093832122" target="_blank" rel="noopener noreferrer" className="btn-support">
                  <i className="bi bi-whatsapp me-2"></i>Chat Now
                </a>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== New Job Popup ===== */}
      <AnimatePresence>
        {showJobPopup && newJobAlert && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="job-popup-modern"
          >
            <div className="popup-header">
              <div className="popup-badge">
                <i className="bi bi-lightning-fill"></i> New Job
              </div>
              <button className="popup-close" onClick={() => setShowJobPopup(false)}>
                <i className="bi bi-x"></i>
              </button>
            </div>

            <h5 className="popup-title">{newJobAlert.Vendorid?.Category || "Service Request"}</h5>

            <div className="popup-details">
              <div className="popup-detail">
                <i className="bi bi-calendar3"></i>
                <span>{newJobAlert.serviceTime || "Today, 3:30 PM"}</span>
              </div>
              <div className="popup-detail">
                <i className="bi bi-geo-alt"></i>
                <span>{newJobAlert.address?.city || "Location"}</span>
              </div>
            </div>

            <div className="popup-footer">
              <span className="popup-amount">₹{newJobAlert.totalAmount || 0}</span>
              <button className="btn-view-job" onClick={() => alert("View job")}>
                View Details
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  );
};

export default TechnicalNonDashboard;
