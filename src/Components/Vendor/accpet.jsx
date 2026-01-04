import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../config";
import Navbar from "../Navbar/navbar";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../Navbar/footer";
import "./Techincal.css";

// Helper functions
const formatINR = (n) =>
  typeof n === "number"
    ? `₹${n.toLocaleString("en-IN")}`
    : "₹0";

const dateStr = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

const JobListings = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("DateDesc");

  // Fetch jobs
  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    api
      .get(`/api/newjob/${vendorId}`)
      .then((res) => setJobs(Array.isArray(res.data) ? res.data : []))
      .catch((e) => console.error("Fetch jobs error:", e))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // Stats
  const stats = useMemo(() => {
    const pending = jobs.filter(j => j?.status === "Pending").length;
    const accepted = jobs.filter(j => j?.status === "Accepted").length;
    const inProgress = jobs.filter(j => j?.status === "In Progress").length;
    const completed = jobs.filter(j => j?.status === "Completed").length;
    return { pending, accepted, inProgress, completed, total: jobs.length };
  }, [jobs]);

  // Filtered list
  const list = useMemo(() => {
    let arr = [...jobs];

    // Tab filter
    if (activeTab !== "all") {
      const statusMap = { pending: "Pending", accepted: "Accepted", progress: "In Progress", completed: "Completed" };
      arr = arr.filter(j => j?.status === statusMap[activeTab]);
    }

    // Search
    const query = q.trim().toLowerCase();
    if (query) {
      arr = arr.filter((j) => {
        const s1 = j?.customer?.fullName?.toLowerCase() ?? "";
        const s2 = j?.service?.toLowerCase() ?? "";
        const s3 = j?.address?.city?.toLowerCase() ?? "";
        return s1.includes(query) || s2.includes(query) || s3.includes(query);
      });
    }

    // Sort
    arr.sort((a, b) => {
      if (sortBy === "DateAsc") return new Date(a.serviceDate) - new Date(b.serviceDate);
      if (sortBy === "AmountDesc") return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
      return new Date(b.serviceDate) - new Date(a.serviceDate);
    });

    return arr;
  }, [jobs, activeTab, q, sortBy]);

  // Update status
  const updateStatus = async (job, target) => {
    try {
      const { data } = await api.put(`/api/bookings/${job._id}/status`, { status: target });
      setJobs((prev) => prev.map((j) => (j._id === job._id ? { ...j, status: data.status } : j)));
      if (target === "In Progress") {
        localStorage.setItem("JObid", job._id);
        navigate(`/vendor/${vendorId}/job/progress`);
      }
    } catch (e) {
      console.error("Status update failed:", e);
      alert("Failed to update status");
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      Pending: { color: "pending", icon: "bi-hourglass-split", action: { label: "Accept", to: "Accepted" } },
      Accepted: { color: "accepted", icon: "bi-check-circle", action: { label: "Start", to: "In Progress" } },
      "In Progress": { color: "progress", icon: "bi-play-circle", action: { label: "Complete", to: "Completed" } },
      Completed: { color: "completed", icon: "bi-check-all", action: null }
    };
    return configs[status] || configs.Pending;
  };

  return (
    <>
      <Navbar />
      <div className="jobs-page">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="jobs-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="page-title">
                <i className="bi bi-briefcase-fill text-warning me-3"></i>
                Job Listings
              </h1>
              <p className="page-subtitle">Manage your service requests and track progress</p>
            </div>
            <Link to={`/vendor/${vendorId}/job/history`} className="btn-history">
              <i className="bi bi-clock-history me-2"></i>
              View History
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="jobs-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-box" onClick={() => setActiveTab("pending")}>
              <span className="stat-count pending">{stats.pending}</span>
              <span className="stat-name">Pending</span>
            </div>
            <div className="stat-box" onClick={() => setActiveTab("accepted")}>
              <span className="stat-count accepted">{stats.accepted}</span>
              <span className="stat-name">Accepted</span>
            </div>
            <div className="stat-box" onClick={() => setActiveTab("progress")}>
              <span className="stat-count progress">{stats.inProgress}</span>
              <span className="stat-name">In Progress</span>
            </div>
            <div className="stat-box" onClick={() => setActiveTab("completed")}>
              <span className="stat-count completed">{stats.completed}</span>
              <span className="stat-name">Completed</span>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="jobs-filters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="filter-tabs">
              {[
                { id: "all", label: "All Jobs" },
                { id: "pending", label: "Pending" },
                { id: "accepted", label: "Accepted" },
                { id: "progress", label: "In Progress" },
                { id: "completed", label: "Completed" }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`filter-tab ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="filter-actions">
              <div className="search-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>
              <select
                className="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="DateDesc">Latest First</option>
                <option value="DateAsc">Oldest First</option>
                <option value="AmountDesc">Highest Amount</option>
              </select>
            </div>
          </motion.div>

          {/* Jobs List */}
          <div className="jobs-list">
            {loading ? (
              <div className="jobs-loading">
                {[1, 2, 3].map(i => (
                  <div className="job-skeleton" key={i}>
                    <div className="skeleton-line w-50"></div>
                    <div className="skeleton-line w-75"></div>
                    <div className="skeleton-line w-25"></div>
                  </div>
                ))}
              </div>
            ) : list.length === 0 ? (
              <div className="empty-jobs">
                <i className="bi bi-inbox"></i>
                <h4>No jobs found</h4>
                <p>No jobs match your current filters</p>
                <button className="btn-clear-filters" onClick={() => { setActiveTab("all"); setQ(""); }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {list.map((job, index) => {
                  const status = job?.status ?? "Pending";
                  const config = getStatusConfig(status);

                  return (
                    <motion.div
                      key={job._id}
                      className={`job-card status-${config.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="job-main">
                        <div className="job-header">
                          <div className="job-service">
                            <h4>{job?.service || "Service Request"}</h4>
                            <span className={`status-badge ${config.color}`}>
                              <i className={`bi ${config.icon}`}></i>
                              {status}
                            </span>
                          </div>
                          <div className="job-amount">{formatINR(job?.totalAmount)}</div>
                        </div>

                        <div className="job-details">
                          <div className="detail-item">
                            <i className="bi bi-person"></i>
                            <span>{job?.customer?.fullName || "Customer"}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-geo-alt"></i>
                            <span>{job?.address?.city || "Location"}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-calendar3"></i>
                            <span>{dateStr(job?.serviceDate)}</span>
                          </div>
                          <div className="detail-item">
                            <i className="bi bi-clock"></i>
                            <span>{job?.serviceTime || "Time TBD"}</span>
                          </div>
                        </div>

                        {(job?.priority?.toLowerCase() === "urgent" || job?.urgent) && (
                          <span className="urgent-badge">
                            <i className="bi bi-exclamation-triangle-fill"></i> Urgent
                          </span>
                        )}
                      </div>

                      <div className="job-actions">
                        {config.action && (
                          <button
                            className={`btn-action ${config.color}`}
                            onClick={() => updateStatus(job, config.action.to)}
                          >
                            {config.action.label}
                            <i className="bi bi-arrow-right"></i>
                          </button>
                        )}
                        <div className="action-icons">
                          <button
                            className="icon-btn"
                            onClick={() => {
                              const p = job?.customer?.phone || job?.customer?.Phone_number;
                              if (p) window.location.href = `tel:${p}`;
                            }}
                          >
                            <i className="bi bi-telephone-fill"></i>
                          </button>
                          <button
                            className="icon-btn"
                            onClick={() => {
                              const e = job?.customer?.email || job?.customer?.Email_address;
                              if (e) window.location.href = `mailto:${e}`;
                            }}
                          >
                            <i className="bi bi-envelope-fill"></i>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .jobs-page {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }

        .jobs-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn-history {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px;
          color: var(--text-secondary, #4b5563);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-history:hover {
          background: var(--primary-light, #FFF8E6);
          border-color: var(--primary, #FFD600);
          color: var(--text-primary, #111827);
        }

        /* Stats */
        .jobs-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-box {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px;
          padding: 1.25rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .stat-box:hover {
          border-color: var(--primary, #FFD600);
          transform: translateY(-2px);
        }

        .stat-count {
          display: block;
          font-size: 2rem;
          font-weight: 700;
        }

        .stat-count.pending { color: #6b7280; }
        .stat-count.accepted { color: #f59e0b; }
        .stat-count.progress { color: #3b82f6; }
        .stat-count.completed { color: #22c55e; }

        .stat-name {
          font-size: 0.8rem;
          color: var(--text-muted, #9ca3af);
          margin-top: 0.25rem;
        }

        /* Filters */
        .jobs-filters {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 14px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
        }

        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
        }

        .filter-tab {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .filter-tab:hover {
          background: var(--bg-subtle, #f3f4f6);
        }

        .filter-tab.active {
          background: var(--primary, #FFD600);
          color: var(--text-primary, #111827);
          font-weight: 600;
        }

        .filter-actions {
          display: flex;
          gap: 0.75rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--bg-subtle, #f3f4f6);
          border-radius: 10px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .search-box:focus-within {
          border-color: var(--primary, #FFD600);
          background: white;
        }

        .search-box i {
          color: var(--text-muted, #9ca3af);
        }

        .search-box input {
          border: none;
          background: transparent;
          font-size: 0.875rem;
          outline: none;
          width: 180px;
        }

        .sort-select {
          padding: 0.5rem 1rem;
          background: var(--bg-subtle, #f3f4f6);
          border: 1px solid transparent;
          border-radius: 10px;
          font-size: 0.875rem;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
        }

        .sort-select:focus {
          border-color: var(--primary, #FFD600);
          outline: none;
        }

        /* Jobs List */
        .jobs-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .job-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }

        .job-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }

        .job-card.status-pending { border-left-color: #9ca3af; }
        .job-card.status-accepted { border-left-color: #f59e0b; }
        .job-card.status-progress { border-left-color: #3b82f6; }
        .job-card.status-completed { border-left-color: #22c55e; }

        .job-main {
          flex: 1;
        }

        .job-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .job-service h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 0.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge.pending { background: #f3f4f6; color: #6b7280; }
        .status-badge.accepted { background: #fef3c7; color: #92400e; }
        .status-badge.progress { background: #dbeafe; color: #1d4ed8; }
        .status-badge.completed { background: #dcfce7; color: #166534; }

        .job-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #22c55e;
        }

        .job-details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.85rem;
          color: var(--text-secondary, #4b5563);
        }

        .detail-item i {
          color: var(--text-muted, #9ca3af);
        }

        .urgent-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          margin-top: 0.75rem;
          padding: 0.375rem 0.75rem;
          background: #fee2e2;
          color: #dc2626;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 6px;
        }

        .job-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.75rem;
        }

        .btn-action {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-action.pending { background: #6b7280; color: white; }
        .btn-action.accepted { background: var(--primary, #FFD600); color: #111827; }
        .btn-action.progress { background: #22c55e; color: white; }

        .btn-action:hover {
          transform: translateY(-1px);
        }

        .action-icons {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border, #e5e7eb);
          background: white;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-muted, #9ca3af);
          transition: all 0.2s ease;
        }

        .icon-btn:hover {
          background: var(--primary-light, #FFF8E6);
          border-color: var(--primary, #FFD600);
          color: var(--primary-dark, #E6C200);
        }

        /* Empty & Loading */
        .empty-jobs {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 16px;
          border: 2px dashed var(--border, #e5e7eb);
        }

        .empty-jobs i {
          font-size: 3rem;
          color: var(--text-muted, #9ca3af);
          margin-bottom: 1rem;
        }

        .empty-jobs h4 {
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-jobs p {
          color: var(--text-muted, #9ca3af);
          margin-bottom: 1.5rem;
        }

        .btn-clear-filters {
          padding: 0.625rem 1.5rem;
          background: var(--primary, #FFD600);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .jobs-loading {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .job-skeleton {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
        }

        .skeleton-line {
          height: 16px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 992px) {
          .jobs-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .job-card {
            flex-direction: column;
            align-items: stretch;
          }
          
          .job-actions {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border, #e5e7eb);
          }
        }

        @media (max-width: 768px) {
          .jobs-filters {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-tabs {
            width: 100%;
            padding-bottom: 0.5rem;
          }
          
          .filter-actions {
            width: 100%;
          }
          
          .search-box {
            flex: 1;
          }
          
          .search-box input {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default JobListings;
