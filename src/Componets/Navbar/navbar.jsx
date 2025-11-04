import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Offcanvas, Button } from "react-bootstrap";

function Navbar() {
  const navigate = useNavigate();
  const vendorId = localStorage.getItem("vendorId");
  const [isOnline, setIsOnline] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  function signout() {
    localStorage.removeItem("vendorId");
    localStorage.removeItem("role");
    navigate("/");
  }

  return (
    <>
      {/* --- Desktop Navbar --- */}
      <nav
        className="navbar navbar-expand-lg bg-white shadow-sm py-2 d-none d-lg-flex"
        style={{
          borderBottom: "4px solid #FFD600",
        }}
      >
        <div className="container-fluid d-flex align-items-center justify-content-between px-4">
          {/* Left: Logo + Name */}
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center"
              style={{
                backgroundColor: "#FFD600",
                width: "42px",
                height: "42px",
              }}
            >
              <i className="bi bi-briefcase-fill text-white fs-5"></i>
            </div>
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold fs-5 text-dark">Apna Mestri</span>
              <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                Professional Services Platform
              </small>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <ul className="navbar-nav mx-auto d-flex flex-row gap-4 fw-semibold">
            <li className="nav-item">
              <Link
                to={`/vendor/${vendorId}`}
                className="nav-link text-dark fw-semibold"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/vendor/${vendorId}/jobs`}
                className="nav-link text-dark fw-semibold"
              >
                Jobs
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/vendor/${vendorId}/Job/history`}
                className="nav-link text-dark fw-semibold"
              >
                Job History
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/vendor/${vendorId}/earnings`}
                className="nav-link text-dark fw-semibold"
              >
                Earnings
              </Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-3">
            {/* Notifications */}
            <div className="position-relative">
              <i className="bi bi-bell-fill fs-5 text-secondary"></i>
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.65rem" }}
              >
                3
              </span>
            </div>

            {/* Messages */}
            <div className="position-relative">
              <i className="bi bi-envelope-fill fs-5 text-secondary"></i>
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                style={{ fontSize: "0.65rem" }}
              >
                5
              </span>
            </div>

            {/* Online toggle */}
            <div className="form-check form-switch me-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="onlineSwitch"
                checked={isOnline}
                onChange={() => setIsOnline(!isOnline)}
              />
              <label
                className="form-check-label small text-muted"
                htmlFor="onlineSwitch"
              >
                {isOnline ? "Online" : "Offline"}
              </label>
            </div>

            {/* Profile Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                as="div"
                id="dropdown-user"
                className="d-flex align-items-center gap-2 border-0 bg-transparent"
                style={{ cursor: "pointer" }}
              >
                <img
                  src="https://i.pravatar.cc/40?img=12"
                  alt="Profile"
                  className="rounded-circle border border-warning border-2"
                  width="42"
                  height="42"
                />
                <div className="d-flex flex-column lh-1">
                  <span className="fw-semibold text-dark">John Anderson</span>
                  <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Premium Vendor
                  </small>
                </div>
                <i className="bi bi-caret-down-fill text-secondary ms-1"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm mt-2">
                <Dropdown.Item as={Link} to={`/${vendorId}/settings`}>
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/wallet/${vendorId}`}>
                  Wallet
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/vendor/Viewproject/${vendorId}`}>
                  View Projects
                </Dropdown.Item>
                <Dropdown.Item
                  as={Link}
                  to={`/vendor/projectupload/${vendorId}`}
                >
                  Upload Project
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={signout} className="text-danger">
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>

      {/* --- Mobile Navbar (same functionality) --- */}
      <div
        className="d-lg-none position-fixed top-0 start-0 w-100 bg-white shadow-sm py-2 px-3 d-flex align-items-center justify-content-between"
        style={{ borderBottom: "4px solid #FFD600", zIndex: 1200 }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-3 d-flex align-items-center justify-content-center"
            style={{
              backgroundColor: "#FFD600",
              width: "38px",
              height: "38px",
            }}
          >
            <i className="bi bi-briefcase-fill text-white fs-5"></i>
          </div>
          <span className="fw-bold text-dark fs-5">Apna Mestri</span>
        </div>

        <Button
          variant="outline-secondary"
          className="border-0"
          onClick={() => setShowProfile(true)}
        >
          <i className="bi bi-list fs-4 text-dark"></i>
        </Button>
      </div>

      {/* Mobile Side Menu */}
      <Offcanvas
        show={showProfile}
        onHide={() => setShowProfile(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="text-center mb-3">
            <img
              src="https://i.pravatar.cc/100?img=12"
              alt="Profile"
              className="rounded-circle border border-warning border-3"
              width="80"
              height="80"
            />
            <h6 className="mt-2 mb-0 fw-semibold">John Anderson</h6>
            <small className="text-muted">Premium Vendor</small>
          </div>
          <hr />
          <div>
            <Link
              to={`/${vendorId}/settings`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              My Profile
            </Link>
            <Link
              to={`/wallet/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              Wallet
            </Link>
            <Link
              to={`/vendor/Viewproject/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              View Projects
            </Link>
            <Link
              to={`/vendor/projectupload/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              Upload Project
            </Link>
            <Link
              to={`/vendor/${vendorId}/jobs`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              Jobs
            </Link>
            <Link
              to={`/vendor/${vendorId}/Job/history`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              Job History
            </Link>
            <Link
              to={`/vendor/${vendorId}/earnings`}
              className="d-block py-2 text-dark"
              onClick={() => setShowProfile(false)}
            >
              Earnings
            </Link>
            <hr />
            <span
              className="d-block py-2 text-danger"
              style={{ cursor: "pointer" }}
              onClick={signout}
            >
              Sign Out
            </span>
          </div>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}

export default Navbar;
