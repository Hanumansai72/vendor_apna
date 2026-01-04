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
      <nav className="product-navbar-yellow d-none d-lg-flex">
        <div className="navbar-container-yellow">
          {/* Logo */}
          <Link to={`/vendor/${vendorId}/products/all`} className="navbar-brand-yellow">
            <div className="brand-icon-yellow">
              <i className="bi bi-box-seam-fill"></i>
            </div>
            <div className="brand-info-yellow">
              <span className="brand-name-yellow">Apna Mestri</span>
              <span className="brand-tagline-yellow">Product Management</span>
            </div>
          </Link>

          {/* Navigation Links - Horizontal Row */}
          <ul className="navbar-nav-yellow">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item-yellow">
                <Link
                  to={link.path}
                  className={`nav-link-yellow ${isActiveRoute(link.path) ? 'active' : ''}`}
                >
                  <i className={`bi ${link.icon}`}></i>
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Actions */}
          <div className="navbar-actions-yellow">
            {/* Notifications */}
            <div className="action-icon-yellow">
              <i className="bi bi-bell-fill"></i>
              {notifications > 0 && (
                <span className="action-badge-yellow">{notifications}</span>
              )}
            </div>

            {/* Messages */}
            <Link to="/user/inbox" className="action-icon-yellow">
              <i className="bi bi-chat-dots-fill"></i>
              {messages > 0 && (
                <span className="action-badge-yellow">{messages}</span>
              )}
            </Link>

            {/* Online Toggle */}
            <div className="online-toggle-yellow">
              <div
                className={`toggle-switch-yellow ${isOnline ? 'active' : ''}`}
                onClick={() => setIsOnline(!isOnline)}
              >
                <div className="toggle-knob-yellow"></div>
              </div>
              <span className="toggle-label-yellow">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* Profile Dropdown */}
            <div
              className={`profile-dropdown-yellow ${isDropdownOpen ? 'open' : ''}`}
              ref={dropdownRef}
            >
              <div
                className="profile-trigger-yellow"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="profile-avatar-yellow">{initials}</div>
                <div className="profile-info-yellow">
                  <span className="profile-name-yellow">{name}</span>
                  <span className="profile-role-yellow">Product Vendor</span>
                </div>
                <i className="bi bi-chevron-down profile-arrow-yellow"></i>
              </div>

              <div className="custom-dropdown-menu-yellow">
                {dropdownLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="dropdown-item-yellow"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    {link.label}
                  </Link>
                ))}
                <div className="dropdown-divider-yellow"></div>
                <div
                  className="dropdown-item-yellow danger"
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
      <div className="mobile-navbar-yellow d-lg-none">
        <div className="mobile-navbar-content-yellow">
          <Link to={`/vendor/${vendorId}/products/all`} className="navbar-brand-yellow">
            <div className="brand-icon-yellow">
              <i className="bi bi-box-seam-fill"></i>
            </div>
            <span className="brand-name-yellow">Apna Mestri</span>
          </Link>

          <div className="mobile-actions-yellow">
            {/* Notifications */}
            <div className="action-icon-yellow">
              <i className="bi bi-bell-fill"></i>
              {notifications > 0 && (
                <span className="action-badge-yellow">{notifications}</span>
              )}
            </div>

            {/* Menu Button */}
            <div
              className="mobile-menu-btn-yellow"
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
            className="mobile-sidebar-overlay-yellow"
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
              className="mobile-sidebar-yellow"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="sidebar-header-yellow">
                <span className="sidebar-title-yellow">Menu</span>
                <div
                  className="sidebar-close-yellow"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className="bi bi-x-lg"></i>
                </div>
              </div>

              {/* Profile Section */}
              <div className="sidebar-profile-yellow">
                <div className="sidebar-avatar-yellow">{initials}</div>
                <div className="sidebar-name-yellow">{name}</div>
                <div className="sidebar-email-yellow">Product Vendor</div>
              </div>

              {/* Online Toggle */}
              <div className="sidebar-toggle-wrapper-yellow">
                <div
                  className={`toggle-switch-yellow ${isOnline ? 'active' : ''}`}
                  onClick={() => setIsOnline(!isOnline)}
                >
                  <div className="toggle-knob-yellow"></div>
                </div>
                <span className="toggle-label-yellow">{isOnline ? 'Online' : 'Offline'}</span>
              </div>

              {/* Navigation */}
              <nav className="sidebar-nav-yellow">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`sidebar-link-yellow ${isActiveRoute(link.path) ? 'active' : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="sidebar-divider-yellow"></div>

                {dropdownLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="sidebar-link-yellow"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <i className={`bi ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                ))}

                <div className="sidebar-divider-yellow"></div>

                <div
                  className="sidebar-link-yellow danger"
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
        /* =============================================
           Yellow & White Product Navbar
           ============================================= */
        
        /* Desktop Navbar */
        .product-navbar-yellow {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          box-shadow: 0 4px 20px rgba(255, 214, 0, 0.3);
          padding: 0.75rem 0;
        }

        .navbar-container-yellow {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .navbar-brand-yellow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }

        .brand-icon-yellow {
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4A200;
          font-size: 1.25rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .brand-info-yellow {
          display: flex;
          flex-direction: column;
        }

        .brand-name-yellow {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          letter-spacing: -0.02em;
        }

        .brand-tagline-yellow {
          font-size: 0.75rem;
          color: #5a4500;
          font-weight: 500;
        }

        /* Navigation Links */
        .navbar-nav-yellow {
          display: flex;
          flex-direction: row;
          list-style: none;
          margin: 0;
          padding: 0;
          gap: 0.5rem;
        }

        .nav-item-yellow {
          list-style: none;
        }

        .nav-link-yellow {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          color: #1a1a1a;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 12px;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.3);
        }

        .nav-link-yellow:hover {
          background: rgba(255,255,255,0.7);
          color: #1a1a1a;
          transform: translateY(-1px);
        }

        .nav-link-yellow.active {
          background: #ffffff;
          color: #1a1a1a;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .nav-link-yellow i {
          font-size: 1rem;
        }

        /* Actions */
        .navbar-actions-yellow {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-icon-yellow {
          position: relative;
          width: 42px;
          height: 42px;
          background: rgba(255,255,255,0.4);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .action-icon-yellow:hover {
          background: #ffffff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .action-icon-yellow i {
          font-size: 1.125rem;
        }

        .action-badge-yellow {
          position: absolute;
          top: -4px;
          right: -4px;
          min-width: 20px;
          height: 20px;
          background: #dc3545;
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #FFD600;
        }

        /* Online Toggle */
        .online-toggle-yellow {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.5rem 1rem;
          background: rgba(255,255,255,0.4);
          border-radius: 12px;
        }

        .toggle-switch-yellow {
          width: 44px;
          height: 24px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          transition: all 0.3s ease;
        }

        .toggle-switch-yellow.active {
          background: #22c55e;
        }

        .toggle-knob-yellow {
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 10px;
          position: absolute;
          top: 2px;
          left: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .toggle-switch-yellow.active .toggle-knob-yellow {
          left: 22px;
        }

        .toggle-label-yellow {
          font-size: 0.8rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        /* Profile Dropdown */
        .profile-dropdown-yellow {
          position: relative;
        }

        .profile-trigger-yellow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          padding-right: 1rem;
          background: rgba(255,255,255,0.4);
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-trigger-yellow:hover {
          background: rgba(255,255,255,0.7);
        }

        .profile-avatar-yellow {
          width: 40px;
          height: 40px;
          background: #ffffff;
          color: #D4A200;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }

        .profile-info-yellow {
          display: flex;
          flex-direction: column;
        }

        .profile-name-yellow {
          font-size: 0.875rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .profile-role-yellow {
          font-size: 0.75rem;
          color: #5a4500;
          font-weight: 500;
        }

        .profile-arrow-yellow {
          font-size: 0.75rem;
          color: #1a1a1a;
          transition: transform 0.2s ease;
        }

        .profile-dropdown-yellow.open .profile-arrow-yellow {
          transform: rotate(180deg);
        }

        .custom-dropdown-menu-yellow {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          padding: 0.5rem;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
          z-index: 1100;
        }

        .profile-dropdown-yellow.open .custom-dropdown-menu-yellow {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .dropdown-item-yellow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: #1a1a1a;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .dropdown-item-yellow:hover {
          background: #FFF8E1;
          color: #D4A200;
        }

        .dropdown-item-yellow i {
          font-size: 1rem;
          width: 20px;
          text-align: center;
        }

        .dropdown-item-yellow.danger {
          color: #dc3545;
        }

        .dropdown-item-yellow.danger:hover {
          background: #FEE2E2;
          color: #dc3545;
        }

        .dropdown-divider-yellow {
          height: 1px;
          background: #e5e7eb;
          margin: 0.5rem 0;
        }

        /* Mobile Navbar */
        .mobile-navbar-yellow {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          box-shadow: 0 4px 20px rgba(255, 214, 0, 0.3);
          padding: 0.875rem 1rem;
        }

        .mobile-navbar-content-yellow {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .mobile-actions-yellow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mobile-menu-btn-yellow {
          width: 44px;
          height: 44px;
          background: rgba(255,255,255,0.4);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mobile-menu-btn-yellow:hover {
          background: #ffffff;
        }

        .mobile-menu-btn-yellow i {
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        /* Mobile Sidebar Overlay */
        .mobile-sidebar-overlay-yellow {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 2000;
          backdrop-filter: blur(4px);
        }

        .mobile-sidebar-yellow {
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          max-width: 85vw;
          height: 100%;
          background: #ffffff;
          box-shadow: -10px 0 40px rgba(0,0,0,0.15);
          overflow-y: auto;
        }

        .sidebar-header-yellow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
        }

        .sidebar-title-yellow {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .sidebar-close-yellow {
          width: 36px;
          height: 36px;
          background: rgba(255,255,255,0.4);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sidebar-close-yellow:hover {
          background: #ffffff;
        }

        .sidebar-close-yellow i {
          font-size: 1rem;
          color: #1a1a1a;
        }

        /* Sidebar Profile */
        .sidebar-profile-yellow {
          text-align: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .sidebar-avatar-yellow {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          color: #1a1a1a;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          margin: 0 auto 0.75rem;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .sidebar-name-yellow {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .sidebar-email-yellow {
          font-size: 0.8rem;
          color: #6b7280;
          margin-top: 0.25rem;
        }

        /* Sidebar Toggle */
        .sidebar-toggle-wrapper-yellow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: #FFF8E1;
          border-bottom: 1px solid #e5e7eb;
        }

        /* Sidebar Nav */
        .sidebar-nav-yellow {
          padding: 1rem;
        }

        .sidebar-link-yellow {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: #1a1a1a;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: 12px;
          transition: all 0.15s ease;
          cursor: pointer;
        }

        .sidebar-link-yellow:hover {
          background: #FFF8E1;
        }

        .sidebar-link-yellow.active {
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          color: #1a1a1a;
          font-weight: 600;
        }

        .sidebar-link-yellow i {
          font-size: 1.125rem;
          width: 24px;
          text-align: center;
        }

        .sidebar-link-yellow.danger {
          color: #dc3545;
        }

        .sidebar-link-yellow.danger:hover {
          background: #FEE2E2;
        }

        .sidebar-divider-yellow {
          height: 1px;
          background: #e5e7eb;
          margin: 0.75rem 0;
        }
      `}</style>
    </>
  );
}

export default ProductNavbar;
