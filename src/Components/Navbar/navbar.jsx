import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Navbar.css";

function Navbar() {
  const [isOnline, setIsOnline] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications] = useState(3);
  const [messages] = useState(5);

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

  const navLinks = [
    { path: `/vendor/${vendorId}`, label: "Dashboard", icon: "bi-grid-fill" },
    { path: `/vendor/${vendorId}/jobs`, label: "Jobs", icon: "bi-briefcase-fill" },
    { path: `/vendor/${vendorId}/Job/history`, label: "History", icon: "bi-clock-history" },
  ];

  const dropdownLinks = [
    { path: `/vendor/${vendorId}/settings`, label: "My Profile", icon: "bi-person-fill" },
    { path: `/wallet/${vendorId}`, label: "Wallet", icon: "bi-wallet2" },
    { path: `/vendor/Viewproject/${vendorId}`, label: "View Projects", icon: "bi-folder-fill" },
    { path: "/user/inbox", label: "Inbox", icon: "bi-envelope-fill" },
    { path: `/vendor/projectupload/${vendorId}`, label: "Upload Project", icon: "bi-cloud-arrow-up-fill" },
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="premium-navbar d-none d-lg-block">
        <div className="navbar-container">
          {/* Logo */}
          <Link to={`/vendor/${vendorId}`} className="navbar-brand">
            <div className="brand-icon">
              <img src="/comapny_logo.ico" alt="Apna Mestri" />
            </div>
            <div className="brand-info">
              <span className="brand-name">Apna Mestri</span>
              <span className="brand-tagline">Professional Services</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <ul className="navbar-nav">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`nav-link ${isActiveRoute(link.path) ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon}`}></i>
                  {link.label}
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
            <div className="action-icon">
              <i className="bi bi-chat-dots-fill"></i>
              {messages > 0 && (
                <span className="action-badge">{messages}</span>
              )}
            </div>

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
                <div className="profile-avatar">{initials}</div>
                <div className="profile-info">
                  <span className="profile-name">{name}</span>
                  <span className="profile-role">Vendor</span>
                </div>
                <i className="bi bi-chevron-down profile-arrow"></i>
              </div>

              <div className="dropdown-menu">
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
          <Link to={`/vendor/${vendorId}`} className="navbar-brand">
            <div className="brand-icon">
              <img src="/comapny_logo.ico" alt="Apna Mestri" />
            </div>
            <span className="brand-name">Apna Mestri</span>
          </Link>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
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
              <i className="bi bi-list fs-4"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-sidebar-overlay open"
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
              style={{ right: 0 }}
            >
              <div className="sidebar-header">
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Menu</span>
                <div
                  className="sidebar-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </div>
              </div>

              {/* Profile Section */}
              <div className="sidebar-profile">
                <div className="sidebar-avatar">{initials}</div>
                <div className="sidebar-name">{name}</div>
                <div className="sidebar-email">Vendor Account</div>
              </div>

              {/* Online Toggle */}
              <div className="online-toggle" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
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
                    {link.label}
                  </Link>
                ))}

                <div style={{ height: '1px', background: 'var(--navbar-border)', margin: '1rem 0' }}></div>

                {dropdownLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="sidebar-link"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    {link.label}
                  </Link>
                ))}

                <div style={{ height: '1px', background: 'var(--navbar-border)', margin: '1rem 0' }}></div>

                <div
                  className="sidebar-link danger"
                  onClick={handleSignout}
                  style={{ cursor: 'pointer' }}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Sign Out
                </div>
              </nav>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
