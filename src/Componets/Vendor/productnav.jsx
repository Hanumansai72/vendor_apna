import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProductNavbar() {
  const navigate = useNavigate();
  const productId = localStorage.getItem("vendorId");
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
          <Link to={`/product/${productId}`} className="navbar-brand fw-bold">Apna Mestri</Link>

          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 d-flex flex-row gap-3">
            <li className="nav-item"><Link to={`/product/${productId}`} className="nav-link">Home</Link></li>
            <li className="nav-item"><Link to={`/product/${productId}/order`} className="nav-link">Orders</Link></li>
            <li className="nav-item"><Link to={`/product/${productId}/order/history`} className="nav-link">Order History</Link></li>
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
                <li><Link to={`/product/${productId}/settings`} className="dropdown-item">My Profile</Link></li>
                <li className="dropdown-item" onClick={signout}>Sign Out</li>
              </ul>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="navbar navbar-light bg-light border-top d-flex d-lg-none fixed-bottom justify-content-around py-1">
        <Link to={`/product/${productId}`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-house fs-5"></i><br />Home
        </Link>
        <Link to={`/product/${productId}/orders`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-briefcase fs-5"></i><br />Orders
        </Link>
        <Link to={`/product/${productId}/history`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-clock-history fs-5"></i><br />History
        </Link>
        <Link to={`/product/${productId}/settings`} className="text-center text-decoration-none text-dark">
          <i className="bi bi-person-circle fs-5"></i><br />Profile
        </Link>
      </nav>
    </>
  );
}

export default ProductNavbar;
