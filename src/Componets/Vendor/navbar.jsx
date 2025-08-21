import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown } from "react-bootstrap"; // ✅ using react-bootstrap dropdown

function Navbar() {
  const navigate = useNavigate();
  const vendorId = localStorage.getItem("vendorId");
  const [isOnline, setIsOnline] = useState(false);

  function signout() {
    localStorage.removeItem("vendorId");
    localStorage.removeItem("role");
    navigate("/");
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar navbar-expand-lg bg-light shadow-sm d-none d-lg-flex">
        <div className="container-fluid">
          <Link to={`/vendor/${vendorId}`} className="navbar-brand fw-bold">
            Apna Mestri
          </Link>

          {/* Center Nav Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
            <li className="nav-item">
              <Link to={`/vendor/${vendorId}`} className="nav-link">Home</Link>
            </li>
            <li className="nav-item">
              <Link to={`/vendor/${vendorId}/jobs`} className="nav-link">Jobs</Link>
            </li>
            <li className="nav-item">
              <Link to={`/vendor/${vendorId}/Job/history`} className="nav-link">Job History</Link>
            </li>
            <li className="nav-item">
              <Link to={`/vendor/${vendorId}/earnings`} className="nav-link">Earnings</Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center">
            <div className="form-check form-switch me-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={isOnline}
                onChange={() => setIsOnline(!isOnline)}
              />
              <label className="form-check-label">
                {isOnline ? "Online" : "Offline"}
              </label>
            </div>

            {/* React-Bootstrap Dropdown */}
            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                Profile
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to={`${vendorId}/settings`}>
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/wallet/${vendorId}`}>
                  Wallet
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/vendor/Viewproject/${vendorId}`}>
                  View Projects
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/vendor/projectupload/${vendorId}`}>
                  Upload Project
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={signout}>Sign Out</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="navbar navbar-light bg-light border-top d-flex d-lg-none fixed-bottom justify-content-around py-1">
        <Link to={`/vendor/${vendorId}`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-house fs-5"></i><br />Home
        </Link>
        <Link to={`/vendor/${vendorId}/jobs`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-briefcase fs-5"></i><br />Jobs
        </Link>
        <Link to={`/vendor/${vendorId}/Job/history`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-clock-history fs-5"></i><br />History
        </Link>
        <Link to={`/vendor/${vendorId}/earnings`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-cash-stack fs-5"></i><br />Earnings
        </Link>
        <Link to={`/wallet/${vendorId}`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-wallet2 fs-5"></i><br />Wallet
        </Link>
        <Link to={`/vendor/Viewproject/${vendorId}`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-eye fs-5"></i><br />Projects
        </Link>
        <Link to={`/vendor/projectupload/${vendorId}`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-upload fs-5"></i><br />Upload
        </Link>
        <Link to={`/vendor/${vendorId}/settings`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-person-circle fs-5"></i><br />Profile
        </Link>
      </nav>
    </>
  );
}

export default Navbar;
