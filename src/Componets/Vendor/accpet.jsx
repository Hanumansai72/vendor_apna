// src/Components/Vendor/JobListingsNew.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../Navbar/footer";

// ---- Helper formatting
const formatINR = (n) =>
  typeof n === "number"
    ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    : "—";

const dateStr = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const JobListings = () => {
  const vendorId = localStorage.getItem("vendorId");
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);

  // filters
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [sortBy, setSortBy] = useState("DateDesc");

  // fetch
  useEffect(() => {
    if (!vendorId) return;
    setLoading(true);
    axios
      .get(`https://backend-d6mx.vercel.app/api/newjob/${vendorId}`)
      .then((res) => {
        setJobs(Array.isArray(res.data) ? res.data : []);
        setUpdatedAt(new Date());
      })
      .catch((e) => console.error("Fetch jobs error:", e))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // locations list
  const locations = useMemo(() => {
    const set = new Set();
    jobs.forEach((j) => {
      const city = j?.address?.city;
      if (city) set.add(city);
    });
    return ["All Locations", ...Array.from(set)];
  }, [jobs]);

  // filter+sort
  const list = useMemo(() => {
    let arr = [...jobs];

    // search
    const query = q.trim().toLowerCase();
    if (query) {
      arr = arr.filter((j) => {
        const s1 = j?.customer?.fullName?.toLowerCase() ?? "";
        const s2 = j?.service?.toLowerCase() ?? "";
        const s3 = j?.address?.city?.toLowerCase() ?? "";
        return s1.includes(query) || s2.includes(query) || s3.includes(query);
      });
    }

    // status
    if (statusFilter !== "All Status") {
      arr = arr.filter((j) => j?.status === statusFilter);
    }

    // location
    if (locationFilter !== "All Locations") {
      arr = arr.filter((j) => j?.address?.city === locationFilter);
    }

    // sort
    arr.sort((a, b) => {
      if (sortBy === "DateAsc") {
        return new Date(a.serviceDate) - new Date(b.serviceDate);
      }
      if (sortBy === "AmountDesc") {
        return (b.totalAmount ?? 0) - (a.totalAmount ?? 0);
      }
      if (sortBy === "AmountAsc") {
        return (a.totalAmount ?? 0) - (b.totalAmount ?? 0);
      }
      // default DateDesc
      return new Date(b.serviceDate) - new Date(a.serviceDate);
    });

    return arr;
  }, [jobs, q, statusFilter, locationFilter, sortBy]);

  // actions
  const updateStatus = async (job, target) => {
    try {
      const { data } = await axios.put(
        `https://backend-d6mx.vercel.app/api/bookings/${job._id}/status`,
        { status: target }
      );

      setJobs((prev) =>
        prev.map((j) => (j._id === job._id ? { ...j, status: data.status } : j))
      );

      // Route to progress screen if starting
      if (target === "In Progress") {
        localStorage.setItem("JObid", job._id);
        navigate(`/vendor/${vendorId}/Job/Progress`);
      }
    } catch (e) {
      console.error("Status update failed:", e);
      alert("Failed to update status");
    }
  };

  const primaryAction = (status) => {
    if (status === "Pending") return { label: "Accept Job", to: "Accepted", color: "btn-warning text-dark" };
    if (status === "Accepted") return { label: "Start Job", to: "In Progress", color: "btn-warning text-dark" };
    if (status === "In Progress") return { label: "Complete Job", to: "Completed", color: "btn-success text-white" };
    return null;
  };

  return (
    <>
      {/* Inline CSS to match the screenshot look */}
      <style>{`
        .jl-bg { background: linear-gradient(180deg,#FFF9E6 0%,#FFFFFF 140px); min-height:100vh; }
        .jl-filter { background:#fff; border:1px solid #FFECB3; border-radius:16px; box-shadow:0 8px 24px rgba(0,0,0,0.06); }
        .jl-input, .jl-select { border:1px solid #FFD54F !important; border-radius:14px !important; padding:12px 14px !important; }
        .jl-label { font-size:0.85rem; color:#6B7280; margin-bottom:6px; }
        .jl-clear { color:#F4B400; font-weight:600; cursor:pointer; }
        .jl-card { background:#fff; border:1px solid #FFECB3; border-radius:18px; box-shadow:0 10px 24px rgba(0,0,0,0.06); padding:18px 20px; }
        .jl-title { font-weight:800; color:#1F2937; font-size:1.25rem; }
        .jl-sub { color:#6B7280; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:999px; font-weight:600; font-size:.85rem; }
        .chip-blue { background:#E6F0FF; color:#2A62F2; }
        .chip-red { background:#FFECEC; color:#D92D20; }
        .chip-yellow { background:#FFF4CC; color:#8A6D00; }
        .chip-green { background:#E8F8EE; color:#118A4E; }
        .status-pill { padding:6px 12px; border-radius:999px; font-weight:700; }
        .st-accepted { background:#FFF4CC; color:#7C5E00; }
        .st-progress { background:#E8F1FF; color:#2A62F2; }
        .st-completed { background:#E8F8EE; color:#118A4E; }
        .st-pending { background:#F3F4F6; color:#6B7280; }
        .amount { color:#118A4E; font-weight:800; font-size:1.5rem; letter-spacing:.2px; }
        .round-btn { width:54px; height:54px; border-radius:12px; border:1px solid #FFD54F; display:flex; align-items:center; justify-content:center; background:#fff; transition:.15s; }
        .round-btn:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,0.08); }
        .muted { color:#9CA3AF; }
      `}</style>

      <div className="jl-bg">
        <Navbar />

        <div className="container py-4">
          {/* Filter bar */}
          <div className="jl-filter p-3 p-md-4 mb-4">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <div className="jl-label">Search jobs</div>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="form-control jl-input"
                  placeholder="Search jobs by customer, location, or service"
                />
              </div>

              <div className="col-md-3">
                <div className="jl-label">Status</div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select jl-select"
                >
                  {["All Status", "Pending", "Accepted", "In Progress", "Completed"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <div className="jl-label">Location</div>
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="form-select jl-select"
                >
                  {locations.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-2">
                <div className="jl-label">Sort</div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select jl-select"
                >
                  <option value="DateDesc">Sort by Date</option>
                  <option value="DateAsc">Oldest First</option>
                  <option value="AmountDesc">Amount High → Low</option>
                  <option value="AmountAsc">Amount Low → High</option>
                </select>
              </div>
            </div>

            <div className="d-flex justify-content-between align-items-center mt-3">
              <small className="muted">
                {updatedAt ? `Last updated ${Math.max(1, Math.round((Date.now() - updatedAt.getTime()) / 60000))} mins ago` : "Loading..."}
              </small>
              {(q || statusFilter !== "All Status" || locationFilter !== "All Locations") && (
                <span
                  className="jl-clear"
                  onClick={() => {
                    setQ("");
                    setStatusFilter("All Status");
                    setLocationFilter("All Locations");
                  }}
                >
                  ⛳ Clear Filters
                </span>
              )}
            </div>
          </div>

          {/* Listing */}
          {loading && <div className="text-center py-5">Loading jobs…</div>}
          {!loading && list.length === 0 && (
            <div className="text-center py-5 text-muted">No jobs found.</div>
          )}

          <div className="d-flex flex-column gap-3">
            {list.map((job) => {
              const status = job?.status ?? "Pending";
              const action = primaryAction(status);

              const statusClass =
                status === "Accepted"
                  ? "st-accepted"
                  : status === "In Progress"
                  ? "st-progress"
                  : status === "Completed"
                  ? "st-completed"
                  : "st-pending";

              return (
                <div key={job._id} className="jl-card">
                  <div className="row g-3 align-items-center">
                    {/* Title + customer */}
                    <div className="col-lg-6">
                      <div className="d-flex align-items-center justify-content-between justify-content-lg-start gap-3">
                        <div className="jl-title">{job?.service || "Service"}</div>
                        <span className={`status-pill ${statusClass}`}>{status}</span>
                      </div>

                      <div className="jl-sub mt-1">
                        {job?.customer?.fullName || "—"} • {job?.address?.city || "—"}
                      </div>

                      <div className="d-flex flex-wrap gap-2 mt-2">
                        <span className="chip chip-blue">
                          <i className="bi bi-wrench-adjustable-circle"></i> {job?.service || "Service"}
                        </span>
                        {(job?.priority?.toLowerCase() === "urgent" || job?.urgent) && (
                          <span className="chip chip-red">
                            <i className="bi bi-exclamation-octagon"></i> Urgent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Date/Time + Amount */}
                    <div className="col-lg-3">
                      <div className="d-flex align-items-center gap-2 jl-sub">
                        <i className="bi bi-calendar-event"></i>
                        <span>{dateStr(job?.serviceDate)}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2 jl-sub mt-1">
                        <i className="bi bi-clock"></i>
                        <span>{job?.serviceTime || "—"}</span>
                      </div>
                      <div className="amount mt-2">{formatINR(job?.totalAmount ?? 0)}</div>
                    </div>

                    {/* Actions */}
                    <div className="col-lg-3 d-flex flex-wrap gap-2 justify-content-lg-end">
                      {action && (
                        <button
                          className={`btn ${action.color} px-4 fw-bold`}
                          onClick={() => updateStatus(job, action.to)}
                        >
                          {action.label}
                        </button>
                      )}

                      <button
                        className="round-btn"
                        title="Call customer"
                        onClick={() => {
                          const p = job?.customer?.phone || job?.customer?.Phone_number;
                          if (p) window.location.href = `tel:${p}`;
                        }}
                      >
                        <i className="bi bi-telephone-fill text-warning"></i>
                      </button>
                      <button
                        className="round-btn"
                        title="Email customer"
                        onClick={() => {
                          const e = job?.customer?.email || job?.customer?.Email_address;
                          if (e) window.location.href = `mailto:${e}`;
                        }}
                      >
                        <i className="bi bi-envelope-fill text-warning"></i>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default JobListings;
