import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

function Navbar({
  homeLabel = "Home",
  jobsLabel = "Job",
  historyLabel = "Job History",
  earningsLabel = "",
  locationName = "",
  homeUrl,
  jobsUrl,
  historyUrl,
  earningsUrl
}) {
  const { id } = useParams();
  function signout(){
    localStorage.removeItem("vendorId");
    navigate("/login")
  }

  const navigate = useNavigate();

  useEffect(() => {
    if (!id) navigate('/login');
  }, [id, navigate]);

  const defaultVendorId = localStorage.getItem("vendorId");

  const resolvedHomeUrl = homeUrl || `/vendor/${defaultVendorId}`;
  const resolvedJobsUrl = jobsUrl || `/vendor/${defaultVendorId}/jobs`;
  const resolvedHistoryUrl = historyUrl || `/vendor/${defaultVendorId}/Job/history`;
  const resolvedEarningsUrl = earningsUrl || `/vendor/${defaultVendorId}/earnings`;
  const profileUrl = `/${defaultVendorId}/settings`;

  const [isOnline, setIsOnline] = useState(false);
  const handleToggle = () => setIsOnline(!isOnline);

  return (
    <>
                 <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm d-none d-lg-flex">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="/">Apna Mestri</a>

          <span className="text-muted ms-3">
            📍 Location: <strong>{locationName || 'Fetching...'}</strong>
          </span>

          <div className="collapse navbar-collapse show" id="mainNavbar">
            <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to={resolvedHomeUrl} className="nav-link">{homeLabel}</Link>
              </li>
              <li className="nav-item">
                <Link to={resolvedJobsUrl} className="nav-link">{jobsLabel}</Link>
              </li>
              <li className="nav-item">
                <Link to={resolvedHistoryUrl} className="nav-link">{historyLabel}</Link>
              </li>
              {earningsLabel && (
                <li className="nav-item">
                  <Link to={resolvedEarningsUrl} className="nav-link">{earningsLabel}</Link>
                </li>
              )}
            </ul>

            <div className="d-flex align-items-center">
              <div className="form-check form-switch me-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="onlineSwitch"
                  checked={isOnline}
                  onChange={handleToggle}
                />
                <label className="form-check-label" htmlFor="onlineSwitch">
                  {isOnline ? "Online" : "Offline"}
                </label>
              </div>

              <div className="dropdown">
                <button
                  className="btn btn-outline-secondary dropdown-toggle d-flex align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  <i className="bi bi-bell me-2"></i>
                  <img
                    src="https://randomuser.me/api/portraits/men/34.jpg"
                    alt="profile"
                    className="rounded-circle"
                    width="40"
                    height="40"
                  />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link to={profileUrl} className="dropdown-item">My Profile</Link></li>
                  <li className="dropdown-item" onClick={signout}>Sign Out</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navbar - Mobile Only */}
      <nav className="navbar navbar-light bg-light border-top d-flex d-lg-none fixed-bottom justify-content-around py-1">
        <Link to={resolvedHomeUrl} className="text-center text-decoration-none text-dark">
          <i className="bi bi-house fs-5"></i><br />
          <small>{homeLabel}</small>
        </Link>
        <Link to={resolvedJobsUrl} className="text-center text-decoration-none text-dark">
          <i className="bi bi-briefcase fs-5"></i><br />
          <small>{jobsLabel}</small>
        </Link>
        <Link to={resolvedHistoryUrl} className="text-center text-decoration-none text-dark">
          <i className="bi bi-clock-history fs-5"></i><br />
          <small>{historyLabel}</small>
        </Link>
        {earningsLabel && (
          <Link to={resolvedEarningsUrl} className="text-center text-decoration-none text-dark">
            <i className="bi bi-cash-stack fs-5"></i><br />
            <small>{earningsLabel}</small>
          </Link>
        )}
        <Link to={profileUrl} className="text-center text-decoration-none text-dark">
          <i className="bi bi-person-circle fs-5"></i><br />
          <small>Profile</small>
        </Link>
      </nav>
    </>
  );
}

export default Navbar;
