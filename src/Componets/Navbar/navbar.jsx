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
      {/* Desktop Navbar */}
      <nav className="navbar navbar-expand-lg bg-light shadow-sm d-none d-lg-flex">
        <div className="container-fluid">
          <Link to={`/vendor/${vendorId}`} className="navbar-brand fw-bold">
            Apna Mestri
          </Link>
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
                <Dropdown.Item as={Link} to={`/${vendorId}/settings`}>
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

      {/* Mobile: Floating Profile Icon on Top, Offcanvas Menu */}
      <div className="d-lg-none position-fixed top-0 start-0 w-100" style={{ zIndex: 1200 }}>
        <div className="d-flex align-items-center px-2 py-2 bg-white shadow-sm">
          {/* Profile avatar button */}
          <Button variant="outline-secondary" className=" me-2" onClick={() => setShowProfile(true)} style={{ width: 40, height: 40,border:"none" }}>
            <i className="bi bi-person-circle fs-4"></i>
          </Button>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>Menu</span>
        </div>
      </div>
      <Offcanvas show={showProfile} onHide={() => setShowProfile(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Profile Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="mb-3">
            <div className="text-muted small">{vendorId}</div>
            <div className="mt-2"><span className="text-warning fs-6">&#9733;</span> 4.36 My Rating</div>
          </div>
          <hr />
          <div>
            <Link to={`/${vendorId}/settings`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>My Profile</Link>
            <Link to={`/wallet/${vendorId}`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>Wallet</Link>
            <Link to={`/vendor/Viewproject/${vendorId}`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>View Projects</Link>
            <Link to={`/vendor/projectupload/${vendorId}`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>Upload Project</Link>
            <Link to={`/vendor/${vendorId}/jobs`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>Jobs</Link>
            <Link to={`/vendor/${vendorId}/Job/history`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>Job History</Link>
            <Link to={`/vendor/${vendorId}/earnings`} className="d-block py-2 text-dark" style={{ textDecoration: "none" }} onClick={() => setShowProfile(false)}>Earnings</Link>
            <hr />
            <span className="d-block py-2 text-danger" style={{ cursor: "pointer" }} onClick={signout}>Sign Out</span>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      
      
    </>
  );
}

export default Navbar;
