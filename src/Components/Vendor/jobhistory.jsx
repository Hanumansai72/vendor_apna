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
import API_BASE_URL from "../../config";
import Navbar from "../Navbar/navbar";
import { useAuth } from "../Auth/AuthContext";
import "./jobhistory.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Footer from "../Navbar/footer";


// ✅ Status configuration
const STATUS = {
  Pending: { text: "Pending", pill: "pill-warning" },
  "In Progress": { text: "In Progress", pill: "pill-yellow" },
  Completed: { text: "Completed", pill: "pill-success" },
  Cancelled: { text: "Cancelled", pill: "pill-danger" },
};

// ✅ Service icons
const SERVICE_PILLS = {
  Electrical: { icon: "bi-lightning-charge-fill" },
  Plumbing: { icon: "bi-tools" },
  Painting: { icon: "bi-brush-fill" },
  Default: { icon: "bi-gear-wide-connected" },
};

const JobHistory = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [payment, setPayment] = useState("");
  const [dateRange, setDateRange] = useState("30");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [show, setShow] = useState(false);
  const [activeJob, setActiveJob] = useState(null);

  // ✅ Fetch jobs
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/jobhistry/${vendorId}`, {
        headers: { "Cache-Control": "no-cache" },
      })
      .then((res) => {
        const normalized = (res.data || []).map((j) => ({
          ...j,
          _status: j.status || "Pending",
          _service: j.Vendorid?.Category || "General",
          _date: j.serviceDate ? new Date(j.serviceDate) : null,
          _payment:
            j.payment?.method || (j.totalAmount ? "Paid" : "Pending"),
          _amount: j.totalAmount ?? 0,
        }));
        setJobs(normalized);
      })
      .catch((err) => console.error("❌ Fetch jobs error:", err))
      .finally(() => setLoading(false));
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

  // ✅ Derived list with filters + sort
  const filtered = useMemo(() => {
    const now = new Date();
    const minDate = new Date(now);
    minDate.setDate(now.getDate() - Number(dateRange || 9999));

    let arr = [...jobs];

    arr = arr.filter((j) => (!j._date ? true : j._date >= minDate));

    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter((j) =>
        [
          j.customerid?.fullName,
          j._service,
          j.address?.city,
          j.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (status) arr = arr.filter((j) => j._status === status);
    if (category) arr = arr.filter((j) => j._service === category);
    if (payment) arr = arr.filter((j) => (j._payment || "Pending") === payment);

    arr.sort((a, b) => {
      if (sort === "latest")
        return (b._date?.getTime() || 0) - (a._date?.getTime() || 0);
      if (sort === "oldest")
        return (a._date?.getTime() || 0) - (b._date?.getTime() || 0);
      if (sort === "amount") return (b._amount || 0) - (a._amount || 0);
      if (sort === "status")
        return (a._status || "").localeCompare(b._status || "");
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
    return <span className={`status-pill ${cfg.pill}`}>{cfg.text}</span>;
  };

  const servicePill = (svc) => {
    const cfg = SERVICE_PILLS[svc] || SERVICE_PILLS.Default;
    return (
      <span className="service-pill">
        <i className={`bi ${cfg.icon} me-1`} />
        {svc}
      </span>
    );
  };

  return (
    <div className="job-history-bg">
      <Navbar />
      <div className="container py-4">
        {/* Filters */}
        <Card className="shadow-sm border-0 rounded-4 mb-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
              <div>
                <h5 className="fw-bold mb-1">Filter & Search Jobs</h5>
                <div className="text-muted small">
                  Refine your job list using search and filters.
                </div>
              </div>
              <Button
                variant="link"
                className="text-decoration-none text-secondary"
                onClick={clearFilters}
              >
                <i className="bi bi-funnel me-1" />
                Clear Filters
              </Button>
            </div>

            <Row className="g-3 mt-3">
              <Col md={4}>
                <Form.Control
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by customer, service or city..."
                  className="rounded-4 ps-5"
                />
              </Col>
              <Col md={2}>
                <Form.Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-4"
                >
                  <option value="">All Status</option>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-4"
                >
                  <option value="">All Services</option>
                  <option>Electrical</option>
                  <option>Plumbing</option>
                  <option>Painting</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  className="rounded-4"
                >
                  <option value="">All Payments</option>
                  <option>Paid</option>
                  <option>Pending</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Jobs List */}
        <Card className="shadow-sm border-0 rounded-4">
          {loading ? (
            <div className="p-4 text-center text-muted">Loading jobs…</div>
          ) : current.length === 0 ? (
            <div className="p-4 text-center text-muted">No jobs found.</div>
          ) : (
            current.map((job) => (
              <div
                key={job._id}
                className="row gx-2 align-items-center job-row mx-0 border-bottom"
              >
                <div className="col-md-3 py-3">
                  <div className="fw-semibold">
                    #{job._id.slice(-6)} — {job._service}
                  </div>
                  <div className="text-muted small">
                    {job.address?.city || "No address"}
                  </div>
                </div>
                <div className="col-md-2 py-3">
                  {job.customerid?.fullName || "Customer"}
                </div>
                <div className="col-md-2 py-3">{servicePill(job._service)}</div>
                <div className="col-md-2 py-3">
                  {job._date?.toLocaleDateString() || "N/A"}
                  <div className="text-muted small">{job.serviceTime}</div>
                </div>
                <div className="col-md-1 py-3">{statusPill(job._status)}</div>
                <div className="col-md-1 py-3 text-success fw-semibold">
                  ₹{job._amount}
                </div>
                <div className="col-md-1 text-end py-3">
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => openDetails(job)}
                  >
                    <i className="bi bi-eye"></i>
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-3 justify-content-center">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            />
            {[...Array(totalPages)].map((_, i) => (
              <Pagination.Item
                key={i}
                active={page === i + 1}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            />
          </Pagination>
        )}
      </div>

      {/* Details Drawer */}
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
          {activeJob ? (
            <>
              <h6 className="fw-bold mb-2">Customer</h6>
              <p>{activeJob.customerid?.fullName}</p>
              <p className="text-muted small">
                {activeJob.address?.street}, {activeJob.address?.city}
              </p>
              <hr />
              <h6 className="fw-bold mb-2">Service</h6>
              <p>{activeJob._service}</p>
              <p className="text-muted small">{activeJob.serviceTime}</p>
              <p className="fw-bold text-success">
                ₹{activeJob._amount?.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-muted">No job selected.</p>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      <Footer></Footer>
    </div>
  );
};

export default JobHistory;
