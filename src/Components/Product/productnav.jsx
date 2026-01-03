import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./product_vendor.css";

function ProductNavbar() {
  const [isOnline, setIsOnline] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(2);
  const [messages] = useState(4);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  const vendorId = user?.id;
  const name = user?.businessName || user?.ownerName || "Vendor";
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleSignout = async () => {
    await logout();
    navigate("/");
  };

  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Main navigation links - matching App.js routes exactly
  const navLinks = [
    { path: `/vendor/${vendorId}/products/all`, label: "Dashboard", icon: "bi-grid-fill" },
    { path: `/vendor/${vendorId}/products`, label: "Products", icon: "bi-box-seam-fill" },
    { path: `/vendor/${vendorId}/products/order`, label: "Orders", icon: "bi-cart-fill" },
    { path: `/vendor/${vendorId}/products/order/history`, label: "History", icon: "bi-clock-history" },
  ];

  // Dropdown links - matching App.js routes exactly
  const dropdownLinks = [
    { path: `/vendor/${vendorId}/products/add`, label: "Add Product", icon: "bi-plus-circle-fill" },
    { path: `/vendor/${vendorId}/products/bulk-upload`, label: "Bulk Upload", icon: "bi-cloud-arrow-up-fill" },
    { path: `/product/wallet/${vendorId}`, label: "Wallet", icon: "bi-wallet2" },
    { path: `/vendor/${vendorId}`, label: "Service Dashboard", icon: "bi-tools" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="product-navbar d-none d-lg-flex">
        <div className="navbar-container">
          {/* Logo */}
          <Link to={`/vendor/${vendorId}/products/all`} className="navbar-brand">
            <div className="brand-icon product">
              <i className="bi bi-box-seam-fill"></i>
            </div>
            <div className="brand-info">
              <span className="brand-name">Apna Mestri</span>
              <span className="brand-tagline">Product Management</span>
            </div>
          </Link>

          {/* Navigation Links - Horizontal Row */}
          <ul className="navbar-nav">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <Link
                  to={link.path}
                  className={`nav-link ${isActiveRoute(link.path) ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon}`}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Notifications */}
            <div className="action-icon">
              <i className="bi bi-bell-fill"></i>
              {notifications > 0 && (
                <span className="action-badge">{notifications}</span>
              )}
            </div>

            {/* Messages */}
            <Link to="/user/inbox" className="action-icon">
              <i className="bi bi-chat-dots-fill"></i>
              {messages > 0 && (
                <span className="action-badge">{messages}</span>
              )}
            </Link>

            {/* Online Toggle */}
            <div className="online-toggle">
              <div
                className={`toggle-switch ${isOnline ? 'active' : ''}`}
                onClick={() => setIsOnline(!isOnline)}
              >
                <div className="toggle-knob"></div>
              </div>
              <span className="toggle-label">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Profile Dropdown */}
            <div
              className={`profile-dropdown ${isDropdownOpen ? 'open' : ''}`}
              ref={dropdownRef}
            >
              <div
                className="profile-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="profile-avatar product">{initials}</div>
                <div className="profile-info">
                  <span className="profile-name">{name}</span>
                  <span className="profile-role">Product Vendor</span>
                </div>
                <i className="bi bi-chevron-down profile-arrow"></i>
              </div>

              <div className="custom-dropdown-menu">
                {dropdownLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    {link.label}
                  </Link>
                ))}
                <div className="dropdown-divider"></div>
                <div
                  className="dropdown-item danger"
                  onClick={handleSignout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Sign Out
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <div className="mobile-navbar d-lg-none">
        <div className="mobile-navbar-content">
          <Link to={`/vendor/${vendorId}/products/all`} className="navbar-brand">
            <div className="brand-icon product">
              <i className="bi bi-box-seam-fill"></i>
            </div>
            <span className="brand-name">Apna Mestri</span>
          </Link>

          <div className="mobile-actions">
            {/* Notifications */}
            <div className="action-icon">
              <i className="bi bi-bell-fill"></i>
              {notifications > 0 && (
                <span className="action-badge">{notifications}</span>
              )}
            </div>

            {/* Menu Button */}
            <div
              className="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <i className="bi bi-list"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsMobileMenuOpen(false);
              }
            }}
          >
            <motion.div
              className="mobile-sidebar"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="sidebar-header">
                <span className="sidebar-title">Menu</span>
                <div
                  className="sidebar-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </div>
              </div>

              {/* Profile Section */}
              <div className="sidebar-profile">
                <div className="sidebar-avatar product">{initials}</div>
                <div className="sidebar-name">{name}</div>
                <div className="sidebar-email">Product Vendor</div>
              </div>

              {/* Online Toggle */}
              <div className="sidebar-toggle-wrapper">
                <div
                  className={`toggle-switch ${isOnline ? 'active' : ''}`}
                  onClick={() => setIsOnline(!isOnline)}
                >
                  <div className="toggle-knob"></div>
                </div>
                <span className="toggle-label">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Navigation */}
              <nav className="sidebar-nav">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sidebar-link ${isActiveRoute(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="sidebar-divider"></div>

                {dropdownLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="sidebar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="sidebar-divider"></div>

                <div
                  className="sidebar-link danger"
                  onClick={handleSignout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign Out</span>
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Product Navbar Specific Styles */
        .product-navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid #e5e7eb;
          padding: 0.75rem 0;
        }

        .product-navbar .navbar-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .product-navbar .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .brand-icon.product {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
        }

        .profile-avatar.product {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .sidebar-avatar.product {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }

        .product-navbar .navbar-nav {
          display: flex;
          flex-direction: row;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }

        .product-navbar .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          color: #4b5563;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .product-navbar .nav-link:hover {
          background: #eff6ff;
          color: #1d4ed8;
        }

        .product-navbar .nav-link.active {
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 600;
        }

        .product-navbar .nav-link i {
          font-size: 1rem;
        }
      `}</style>
    </>
  );
}

export default ProductNavbar;
