import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Offcanvas, Button } from "react-bootstrap";
import { useAuth } from "../Auth/AuthContext";

function ProductNavbar() {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const vendorId = authUser?.id;
  const [isOnline, setIsOnline] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  async function signout() {
    await logout();
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
              <i className="bi bi-box-seam-fill text-white fs-5"></i>
            </div>
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold fs-5 text-dark">Apna Mestri</span>
              <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                Product Management Panel
              </small>
            </div>
          </div>

          {/* Center Links */}
          <ul className="navbar-nav mx-auto d-flex flex-row gap-4 fw-semibold">
            <li className="nav-item">
              <Link
                to={`/Product/${vendorId}`}
                className="nav-link text-dark fw-semibold"
              >
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/product/${vendorId}/ViewProduct`}
                className="nav-link text-dark fw-semibold"
              >
                View Products
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/addproduct/${vendorId}`}
                className="nav-link text-dark fw-semibold"
              >
                Add Product
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/addproduct/${vendorId}/BulkUpload`}
                className="nav-link text-dark fw-semibold"
              >
                Bulk Upload
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/Product/${vendorId}/order`}
                className="nav-link text-dark fw-semibold"
              >
                Orders
              </Link>
            </li>
            <li className="nav-item">
              <Link
                to={`/Product/${vendorId}/order/history`}
                className="nav-link text-dark fw-semibold"
              >
                Order History
              </Link>
            </li>
          </ul>

          {/* Right Side */}
          <div className="d-flex align-items-center gap-3">
            {/* Notification Bell */}
            <div className="position-relative">
              <i className="bi bi-bell-fill fs-5 text-secondary"></i>
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                style={{ fontSize: "0.65rem" }}
              >
                2
              </span>
            </div>

            {/* Message Icon */}
            <div className="position-relative">
              <i className="bi bi-chat-dots-fill fs-5 text-secondary"></i>
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark"
                style={{ fontSize: "0.65rem" }}
              >
                4
              </span>
            </div>

            {/* Online Toggle */}
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
                  src="https://i.pravatar.cc/100?img=5"
                  alt="Profile"
                  width="40"
                  height="40"
                  className="rounded-circle border border-warning border-2"
                />
                <div className="d-flex flex-column lh-1">
                  <span className="fw-semibold text-dark">Vendor Admin</span>
                  <small
                    className="text-muted"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Product Vendor
                  </small>
                </div>
                <i className="bi bi-caret-down-fill text-secondary ms-1"></i>
              </Dropdown.Toggle>

              <Dropdown.Menu className="shadow-sm mt-2">
                <Dropdown.Item as={Link} to={`/product/${vendorId}/settings`}>
                  My Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/wallet/${vendorId}`}>
                  Wallet
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/product/${vendorId}/analytics`}>
                  Analytics
                </Dropdown.Item>
                <Dropdown.Item as={Link} to={`/product/${vendorId}/help`}>
                  Help & Support
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

      {/* --- Mobile Navbar --- */}
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
            <i className="bi bi-box-seam-fill text-white fs-5"></i>
          </div>
          <span className="fw-bold text-dark fs-5">Apna Mestri</span>
        </div>

        <Button
          variant="outline-secondary"
          className="border-0"
          onClick={() => setShowMenu(true)}
        >
          <i className="bi bi-list fs-4 text-dark"></i>
        </Button>
      </div>

      {/* Mobile Menu Drawer */}
      <Offcanvas
        show={showMenu}
        onHide={() => setShowMenu(false)}
        placement="end"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <div className="text-center mb-3">
            <img
              src="https://i.pravatar.cc/100?img=5"
              alt="Profile"
              className="rounded-circle border border-warning border-3"
              width="80"
              height="80"
            />
            <h6 className="mt-2 mb-0 fw-semibold">Vendor Admin</h6>
            <small className="text-muted">Product Vendor</small>
          </div>
          <hr />
          <div>
            <Link
              to={`/Product/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              to={`/product/${vendorId}/ViewProduct`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              View Products
            </Link>
            <Link
              to={`/addproduct/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Add Product
            </Link>
            <Link
              to={`/addproduct/${vendorId}/BulkUpload`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Bulk Upload
            </Link>
            <Link
              to={`/Product/${vendorId}/order`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Orders
            </Link>
            <Link
              to={`/Product/${vendorId}/order/history`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Order History
            </Link>
            <Link
              to={`/product/${vendorId}/settings`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Profile Settings
            </Link>
            <Link
              to={`/wallet/${vendorId}`}
              className="d-block py-2 text-dark"
              onClick={() => setShowMenu(false)}
            >
              Wallet
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

export default ProductNavbar;
