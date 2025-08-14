import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const vendorId = localStorage.getItem("vendorId");
  const [isOnline, setIsOnline] = useState(false);

  function signout() {
    localStorage.removeItem("vendorId");
    localStorage.removeItem("role");
    navigate("/login");
  }

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="navbar navbar-expand-lg bg-light shadow-sm d-none d-lg-flex">
        <div className="container-fluid">
          <Link to={`/vendor/${vendorId}`} className="navbar-brand fw-bold">Apna Mestri</Link>

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
            <li className="nav-item"><Link to={`/vendor/${vendorId}`} className="nav-link">Home</Link></li>
            <li className="nav-item"><Link to={`/vendor/${vendorId}/jobs`} className="nav-link">Jobs</Link></li>
            <li className="nav-item"><Link to={`/vendor/${vendorId}/Job/history`} className="nav-link">Job History</Link></li>
            <li className="nav-item"><Link to={`/vendor/${vendorId}/earnings`} className="nav-link">Earnings</Link></li>
          </ul>

          <div className="d-flex align-items-center">
            <div className="form-check form-switch me-3">
              <input type="checkbox" className="form-check-input" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
              <label className="form-check-label">{isOnline ? "Online" : "Offline"}</label>
            </div>

            <div className="dropdown">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                Profile
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><Link to={`/vendor/${vendorId}/settings`} className="dropdown-item">My Profile</Link></li>
                <li className="dropdown-item" onClick={signout}>Sign Out</li>
              </ul>
            </div>
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
        <Link to={`/vendor/${vendorId}/settings`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-person-circle fs-5"></i><br />Profile
        </Link>
      </nav>
    </>
  );
}

export default Navbar;
