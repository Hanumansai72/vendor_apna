import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaRegClock
} from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light pt-5 pb-3 border-top border-secondary">
      <Container>
        <Row className="mb-5">
          {/* Brand Info */}
          <Col md={3}>
            
              <div className="mb-3 d-flex align-items-center">
  <img
    src={`${process.env.PUBLIC_URL}/Changed_logo.png`}
    alt="Apna Mestri Logo"
    style={{
      width: '130px',   // adjust size as needed
      height: '130px',
      objectFit: 'contain',
      marginRight: '10px',
      paddingTop:"20px",
      paddingRight:"-5px"
    }}
  />
  <h5 className="mb-0 fw-bold text-warning" style={{paddingLeft:"8px", width:"100%"}}>Apna Mestri</h5>
</div>

            <p className="text-white-50 small">
              Your trusted platform for civil engineering services and construction materials. Building dreams with quality and precision across India.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="#" className="text-light"><FaFacebookF /></a>
              <a href="#" className="text-light"><FaTwitter /></a>
              <a href="#" className="text-light"><FaInstagram /></a>
              <a href="#" className="text-light"><FaLinkedinIn /></a>
            </div>
          </Col>

          {/* Services */}
          <Col md={3}>
            <h6 className="fw-bold text-light">Services</h6>
            <ul className="list-unstyled text-white-50 small">
              <li>Civil Engineer</li>
              <li>Contractor</li>
              <li>Mason</li>
              <li>Site Engineer</li>
              <li>Equipment Rental</li>
              <li>Material Supplier</li>
            </ul>
          </Col>

          {/* Materials */}
          <Col md={3}>
            <h6 className="fw-bold text-light">Materials</h6>
            <ul className="list-unstyled text-white-50 small">
              <li>Cement & Concrete</li>
              <li>Steel & Rebar</li>
              <li>Bricks & Blocks</li>
              <li>Paints & Coatings</li>
              <li>Construction Tools</li>
              <li>Safety Equipment</li>
            </ul>
          </Col>

          {/* Contact */}
          <Col md={3}>
            <h6 className="fw-bold text-light">Contact</h6>
            <ul className="list-unstyled text-white-50 small">
              <li><FaPhoneAlt className="me-2 text-warning" />+91 8555965140</li>
              <li><FaEnvelope className="me-2 text-danger" />help@apnamestri.com</li>
              <li><FaMapMarkerAlt className="me-2 text-warning" />Hyderabadm India</li>
              <li><FaRegClock className="me-2 text-info" />24/7 Available</li>
            </ul>
          </Col>
        </Row>

        {/* Bottom links */}
        <div className="d-flex justify-content-between border-top border-secondary pt-3 text-white-50 small flex-column flex-md-row">
          <p className="mb-2 mb-md-0">© 2025 Civil Mestri. All rights reserved.</p>
          <div className="d-flex gap-3">
            <a href="#" className="text-white-50">Privacy Policy</a>
            <a href="#" className="text-white-50">Terms of Service</a>
            <a href="#" className="text-white-50">Support</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
