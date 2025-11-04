import React, { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  Offcanvas,
  Pagination,
  Row,
} from "react-bootstrap";
import axios from "axios";
import Navbar from "../Navbar/navbar";
import "./jobhistory.css"; // styles below
import "bootstrap-icons/font/bootstrap-icons.css";

const STATUS = {
  Pending: { text: "Pending", bs: "warning-subtle", pill: "pill-warning" },
  "In Progress": { text: "In Progress", bs: "warning-subtle", pill: "pill-yellow" },
  Completed: { text: "Completed", bs: "success-subtle", pill: "pill-success" },
  Cancelled: { text: "Cancelled", bs: "danger-subtle", pill: "pill-danger" },
};

const SERVICE_PILLS = {
  Electrical: { icon: "bi-lightning-charge-fill", pill: "svc-electrical" },
  Plumbing: { icon: "bi-tools", pill: "svc-plumbing" },
  Painting: { icon: "bi-brush-fill", pill: "svc-painting" },
};

const JobHistory = () => {
  const vendorId = localStorage.getItem("vendorId");

  // data
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [dateRange, setDateRange] = useState("30"); // days
  const [sort, setSort] = useState("latest");

  // pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // details drawer
  const [show, setShow] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    axios
      .get(`https://backend-d6mx.vercel.app/api/newjob/${vendorId}`)
      .then((res) => {
        if (!mounted) return;
        // normalize a bit for safe rendering
        const normalized = (res.data || []).map((j) => ({
          ...j,
          _status: j.status || "Pending",
          _service: j.service || "Electrical",
          _date: j.serviceDate ? new Date(j.serviceDate) : null,
          _duration: j.duration || j.hours || "",
          _payment: j.payment?.status || (j.payment?.amount ? "Paid" : "Pending"),
          _amount: j.totalAmount ?? j.payment?.amount ?? 0,
        }));
        setJobs(normalized);
      })
      .catch((err) => console.error("Fetch jobs error:", err))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, [vendorId]);

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCategory("");
    setPayment("");
    setDateRange("30");
    setSort("latest");
    setPage(1);
  };

  // derived
  const filtered = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - Number(dateRange || 9999));

    let arr = [...jobs];

    // range
    arr = arr.filter((j) => (!j._date ? true : j._date >= minDate));

    // search
    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter((j) => {
        const fields = [
          j._id,
          j.jobId,
          j.customer?.fullName,
          j._service,
          j.address?.city,
          j.address?.street,
          j.description,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return fields.includes(q);
      });
    }

    // status
    if (status) arr = arr.filter((j) => j._status === status);

    // category
    if (category) arr = arr.filter((j) => j._service === category);

    // payment
    if (payment) {
      const want = payment === "All" ? "" : payment;
      if (want) arr = arr.filter((j) => (j._payment || "Pending") === want);
    }

    // sort
    arr.sort((a, b) => {
      if (sort === "latest") return (b._date?.getTime() || 0) - (a._date?.getTime() || 0);
      if (sort === "oldest") return (a._date?.getTime() || 0) - (b._date?.getTime() || 0);
      if (sort === "amount") return (b._amount || 0) - (a._amount || 0);
      if (sort === "status") return (a._status || "").localeCompare(b._status || "");
      return 0;
    });

    return arr;
  }, [jobs, search, status, category, payment, dateRange, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const current = filtered.slice(start, end);

  const openDetails = (job) => {
    setActiveJob(job);
    setShow(true);
  };

  const statusPill = (s) => {
    const cfg = STATUS[s] || STATUS.Pending;
    return (
      <span className={`status-pill ${cfg.pill}`}>
        <i className="bi bi-check-circle-fill me-1" />
        {cfg.text}
      </span>
    );
  };

  const servicePill = (svc) => {
    const cfg = SERVICE_PILLS[svc] || SERVICE_PILLS.Electrical;
    return (
      <span className={`service-pill ${cfg.pill}`}>
        <i className={`bi ${cfg.icon} me-1`} />
        {svc}
      </span>
    );
  };

  return (
    <div className="job-history-bg">
      <Navbar />

      <div className="container py-4">
        {/* Filter & Search */}
        <Card className="shadow-sm border-0 rounded-4 filter-card mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h5 className="fw-bold mb-1">Filter & Search Jobs</h5>
                <div className="text-muted small">
                  Refine your job list using search, filters and sorting.
                </div>
              </div>
              <Button
                variant="link"
                className="text-decoration-none text-secondary d-flex align-items-center gap-2"
                onClick={clearFilters}
              >
                <i className="bi bi-funnel"></i> Clear All Filters
              </Button>
            </div>

            <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Label className="muted-label">Search Jobs</Form.Label>
                <div className="position-relative">
                  <i className="bi bi-search position-absolute search-icon" />
                  <Form.Control
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by job ID, customer or service…"
                    className="rounded-4 ps-5"
                  />
                </div>
              </Col>
              <Col md={2}>
                <Form.Label className="muted-label">Status</Form.Label>
                <Form.Select
                  className="rounded-4"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="muted-label">Date Range</Form.Label>
                <Form.Select
                  className="rounded-4"
                  value={dateRange}
                  onChange={(e) => {
                    setDateRange(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 12 months</option>
                  <option value="9999">All time</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="muted-label">Service Category</Form.Label>
                <Form.Select
                  className="rounded-4"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Categories</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>Painting</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Label className="muted-label">Payment Status</Form.Label>
                <Form.Select
                  className="rounded-4"
                  value={payment}
                  onChange={(e) => {
                    setPayment(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Payments</option>
                  <option>Paid</option>
                  <option>Pending</option>
                  <option>Failed</option>
                </Form.Select>
              </Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
              <small className="text-secondary">
                Showing {Math.min(filtered.length, end) || 0} of {filtered.length} jobs
              </small>
              <div className="d-flex align-items-center gap-2">
                <span className="text-secondary small">Sort by:</span>
                <Form.Select
                  className="rounded-4 sort-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </Form.Select>
                <Button variant="outline-secondary" className="btn-ghost">
                  <i className="bi bi-grid-3x3-gap-fill"></i>
                </Button>
                <Button variant="outline-secondary" className="btn-ghost">
                  <i className="bi bi-list-ul"></i>
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Header row with Export/Print */}
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h4 className="fw-bold m-0">Job History</h4>
          <div className="d-flex gap-2">
            <Button variant="light" className="rounded-3 shadow-sm">
              <i className="bi bi-box-arrow-down me-2"></i> Export
            </Button>
            <Button variant="warning" className="rounded-3 text-dark fw-semibold shadow-sm">
              <i className="bi bi-printer me-2"></i> Print
            </Button>
          </div>
        </div>

        {/* Job list */}
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <div className="table-head px-3 py-2 text-secondary small fw-semibold d-none d-md-grid">
            <div className="row gx-2">
              <div className="col-md-3">JOB DETAILS</div>
              <div className="col-md-2">CUSTOMER</div>
              <div className="col-md-2">SERVICE TYPE</div>
              <div className="col-md-2">DATE & DURATION</div>
              <div className="col-md-1">STATUS</div>
              <div className="col-md-1">PAYMENT</div>
              <div className="col-md-1 text-end">ACTIONS</div>
            </div>
          </div>

        {loading ? (
          <div className="p-4 text-center text-secondary">Loading jobs…</div>
        ) : current.length === 0 ? (
          <div className="p-4 text-center text-secondary">No jobs found.</div>
        ) : (
          current.map((job) => (
            <div key={job._id} className="row gx-2 align-items-center job-row mx-0">
              {/* Job details */}
              <div className="col-md-3 py-3">
                <div className="fw-semibold">
                  #{job.jobId || job._id?.slice(-6)} &nbsp; {job._service}{" "}
                </div>
                <div className="text-muted small">
                  {(job.description && job.description.length > 72
                    ? job.description.slice(0, 72) + "…"
                    : job.description) || `${job.address?.street || ""}`.trim()}
                </div>
              </div>

              {/* Customer */}
              <div className="col-md-2 py-3">
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar bg-warning-subtle">
                    <i className="bi bi-person-fill text-warning"></i>
                  </div>
                  <div>
                    <div className="fw-semibold">{job.customer?.fullName || "Customer"}</div>
                    <div className="text-muted small">
                      {job.address?.city || "-"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Type */}
              <div className="col-md-2 py-3">{servicePill(job._service)}</div>

              {/* Date & duration */}
              <div className="col-md-2 py-3">
                <div className="fw-semibold">
                  {job._date ? job._date.toLocaleDateString() : "-"}
                </div>
                <div className="text-muted small">
                  {job._duration ? `${job._duration} hours` : job.serviceTime || ""}
                </div>
              </div>

              {/* Status */}
              <div className="col-md-1 py-3">{statusPill(job._status)}</div>

              {/* Payment */}
              <div className="col-md-1 py-3">
                <div className={`fw-semibold ${job._payment === "Paid" ? "text-success" : "text-secondary"}`}>
                  ₹{job._amount?.toLocaleString() || 0}
                </div>
                <div className="text-muted small">{job._payment || "Pending"}</div>
              </div>

              {/* Actions */}
              <div className="col-md-1 py-3 text-end">
                <div className="d-inline-flex gap-2">
                  <Button
                    size="sm"
                    variant="light"
                    className="rounded-3 shadow-sm"
                    onClick={() => openDetails(job)}
                    title="View details"
                  >
                    <i className="bi bi-eye" />
                  </Button>
                  <Button size="sm" variant="light" className="rounded-3 shadow-sm" title="Download">
                    <i className="bi bi-download" />
                  </Button>
                  <Button size="sm" variant="light" className="rounded-3 shadow-sm" title="More">
                    <i className="bi bi-three-dots" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <small className="text-secondary">
              Showing {start + 1}-{Math.min(end, filtered.length)} of {filtered.length} results
            </small>
            <Pagination className="m-0">
              <Pagination.Prev
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Pagination.Prev>
              {[...Array(totalPages)].slice(0, 5).map((_, i) => {
                const n = i + Math.max(1, Math.min(page - 2, totalPages - 4));
                return (
                  <Pagination.Item key={n} active={page === n} onClick={() => setPage(n)}>
                    {n}
                  </Pagination.Item>
                );
              })}
              <Pagination.Next
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Pagination.Next>
            </Pagination>
          </div>
        )}
      </div>

      {/* Job Details Drawer */}
      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="end"
        className="details-drawer"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Job Details</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {!activeJob ? (
            <div className="text-secondary">No job selected.</div>
          ) : (
            <>
              <Card className="rounded-4 border-0 shadow-sm mb-3">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="fw-bold h6 mb-1">
                        #{activeJob.jobId || activeJob._id?.slice(-6)} &nbsp;
                        {activeJob._service} Repair
                      </div>
                      <div className="text-muted small">
                        {activeJob.description || "—"}
                      </div>
                    </div>
                    {statusPill(activeJob._status)}
                  </div>
                </Card.Body>
              </Card>

              <h6 className="fw-bold">Customer Information</h6>
              <Card className="rounded-4 border-0 shadow-sm mb-4">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="avatar-lg bg-warning-subtle">
                    <i className="bi bi-person-fill text-warning"></i>
                  </div>
                  <div>
                    <div className="fw-semibold">{activeJob.customer?.fullName || "Customer"}</div>
                    <div className="text-muted small">
                      {activeJob.address?.street || ""} {activeJob.address?.city || ""}
                    </div>
                    {activeJob.customer?.phone && (
                      <div className="small mt-1">
                        <i className="bi bi-telephone-fill me-1 text-warning" />
                        {activeJob.customer.phone}
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>

              <h6 className="fw-bold">Job Details</h6>
              <Card className="rounded-4 border-0 shadow-sm mb-4">
                <Card.Body>
                  <Row className="g-3">
                    <Col xs={6}>
                      <div className="muted-label small">Service Type</div>
                      <div className="fw-semibold">{activeJob._service}</div>
                    </Col>
                    <Col xs={6}>
                      <div className="muted-label small">Date</div>
                      <div className="fw-semibold">
                        {activeJob._date ? activeJob._date.toLocaleDateString() : "—"}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="muted-label small">Duration</div>
                      <div className="fw-semibold">
                        {activeJob._duration ? `${activeJob._duration} hours` : "—"}
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="muted-label small">Payment</div>
                      <div className="fw-semibold text-success">₹{activeJob._amount?.toLocaleString() || 0}</div>
                      <div className="text-muted small">{activeJob._payment || "Pending"}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <Button variant="warning" className="w-100 fw-semibold text-dark rounded-3">
                <i className="bi bi-receipt me-2" />
                View Invoice
              </Button>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </div>
  );
};

export default JobHistory;
