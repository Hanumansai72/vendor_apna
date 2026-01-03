import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <Container>
        <Row className="g-4 mb-5">
          {/* Brand Section */}
          <Col lg={4} md={6}>
            <div className="footer-brand mb-4">
              <div className="brand-icon">
                <img src="/comapny_logo.ico" alt="Apna Mestri" />
              </div>
              <span className="brand-text">Apna Mestri</span>
            </div>
            <p className="footer-desc">
              Empowering skilled professionals to grow their business.
              Join thousands of trusted vendors delivering excellence across the country.
            </p>
            <div className="social-links">
              <a href="#" className="social-link"><i className="bi bi-facebook"></i></a>
              <a href="#" className="social-link"><i className="bi bi-instagram"></i></a>
              <a href="#" className="social-link"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="social-link"><i className="bi bi-linkedin"></i></a>
            </div>
          </Col>

          {/* Quick Links */}
          <Col lg={2} md={6}>
            <h5 className="footer-heading">Dashboard</h5>
            <ul className="footer-links">
              <li><Link to="/vendor/dashboard">Overview</Link></li>
              <li><Link to="/vendor/jobs">My Jobs</Link></li>
              <li><Link to="/vendor/products">Products</Link></li>
              <li><Link to="/vendor/wallet">Earnings</Link></li>
            </ul>
          </Col>

          {/* Support */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading">Support</h5>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Vendor Guidelines</a></li>
            </ul>
          </Col>

          {/* Contact - Updated to match color scheme */}
          <Col lg={3} md={6}>
            <h5 className="footer-heading">Contact Us</h5>
            <ul className="contact-info">
              <li>
                <i className="bi bi-geo-alt-fill text-warning"></i>
                <span>123 Business Park, Tech City</span>
              </li>
              <li>
                <i className="bi bi-envelope-fill text-warning"></i>
                <span>support@apnamestri.com</span>
              </li>
              <li>
                <i className="bi bi-telephone-fill text-warning"></i>
                <span>+91 1800-123-4567</span>
              </li>
            </ul>
          </Col>
        </Row>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <p className="copyright mb-0">
                &copy; {currentYear} Apna Mestri. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end mt-3 mt-md-0">
              <div className="app-badges">
                <span className="secure-badge">
                  <i className="bi bi-shield-lock-fill me-2"></i>
                  100% Secure Payments
                </span>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      <style>{`
                .footer-section {
                    background-color: #111827;
                    color: #9ca3af;
                    padding: 4rem 0 2rem;
                    margin-top: auto;
                    border-top: 4px solid #FFD600;
                }

                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .brand-icon {
                    width: 40px;
                    height: 40px;
                    background: white;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px;
                }

                .brand-icon img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .brand-text {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                }

                .footer-desc {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 1.5rem;
                    max-width: 320px;
                }

                .footer-heading {
                    color: #fff;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .footer-links {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .footer-links li {
                    margin-bottom: 0.75rem;
                }

                .footer-links a {
                    color: #9ca3af;
                    text-decoration: none;
                    transition: all 0.2s ease;
                    font-size: 0.95rem;
                }

                .footer-links a:hover {
                    color: #FFD600;
                    padding-left: 5px;
                }

                .contact-info {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .contact-info li {
                    display: flex;
                    align-items: flex-start;
                    gap: 1rem;
                    margin-bottom: 1rem;
                    font-size: 0.95rem;
                }

                .contact-info i {
                    margin-top: 0.2rem;
                }

                .social-links {
                    display: flex;
                    gap: 1rem;
                }

                .social-link {
                    width: 36px;
                    height: 36px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #fff;
                    transition: all 0.3s ease;
                    text-decoration: none;
                }

                .social-link:hover {
                    background: #FFD600;
                    color: #111827;
                    transform: translateY(-3px);
                }

                .footer-bottom {
                    margin-top: 3rem;
                    padding-top: 2rem;
                    border-top: 1px solid rgba(255,255,255,0.1);
                }

                .copyright {
                    font-size: 0.9rem;
                }

                .secure-badge {
                    display: inline-flex;
                    align-items: center;
                    padding: 0.5rem 1rem;
                    background: rgba(40, 167, 69, 0.1);
                    color: #2fb344;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    border: 1px solid rgba(40, 167, 69, 0.2);
                }
            `}</style>
    </footer>
  );
};

export default Footer;
