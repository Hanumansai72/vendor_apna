import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductNavbar from './productnav';
import Footer from '../Navbar/footer';
import 'bootstrap-icons/font/bootstrap-icons.css';

const OrderStatus = () => {
  // Sample order data - in real app this would come from props/API
  const order = {
    id: '#ORD-25789',
    date: 'April 22, 2025, 10:43 AM',
    product: {
      name: 'Ergonomic Office Chair - Black',
      quantity: 2,
      image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300'
    },
    customer: {
      name: 'Michael Johnson',
      contact: '+1 (555) 123-4567',
      address: '1234 Business Park Ave, Suite 100, San Francisco, CA 94107'
    },
    instructions: 'Please deliver during business hours (9 AM - 5 PM). Call customer 30 minutes before arrival. Leave packages at the reception desk if no one is available to receive.',
    status: 'Accepted',
    statusUpdated: 'April 22, 2025, 11:15 AM',
    delivery: {
      method: 'Standard Shipping',
      estimated: 'April 25, 2025',
      tracking: 'TRK4587654321'
    },
    payment: {
      method: 'Visa **** 4567',
      subtotal: 299.98,
      shipping: 12.99,
      tax: 29.99,
      total: 342.96
    },
    timeline: [
      { date: 'April 22, 2025, 10:43 AM', title: 'Order Received', description: 'Order has been placed successfully', completed: true },
      { date: 'April 22, 2025, 11:15 AM', title: 'Order Accepted', description: 'Order has been reviewed and accepted for processing', completed: true },
      { date: 'Expected by April 25, 2025', title: 'Delivery', description: 'Package will be delivered to the customer', completed: false }
    ]
  };

  return (
    <div className="order-status-page">
      <ProductNavbar />

      <div className="container-xl py-4">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link to="/orderhistory" className="back-link">
            <i className="bi bi-arrow-left"></i>
            <span>Back to Orders</span>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          className="order-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-receipt"></i>
            </div>
            <div>
              <h1 className="order-title">Order Details</h1>
              <p className="order-id-text">{order.id}</p>
            </div>
          </div>
          <div className="status-badge-large">
            <i className="bi bi-check-circle-fill"></i>
            {order.status}
          </div>
        </motion.div>

        <div className="content-grid">
          {/* Left Column - Main Content */}
          <div className="main-column">
            {/* Order Info Card */}
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-header">
                <i className="bi bi-box-seam"></i>
                <h3>Order Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Order ID</span>
                    <span className="info-value highlight">{order.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Date</span>
                    <span className="info-value">{order.date}</span>
                  </div>
                </div>
                <div className="product-display">
                  <img src={order.product.image} alt="" className="product-image" />
                  <div className="product-details">
                    <h4>{order.product.name}</h4>
                    <span className="quantity-badge">Qty: {order.product.quantity}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Customer Info Card */}
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="card-header">
                <i className="bi bi-person"></i>
                <h3>Customer Information</h3>
              </div>
              <div className="card-content">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Customer Name</span>
                    <span className="info-value">{order.customer.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Contact</span>
                    <span className="info-value">{order.customer.contact}</span>
                  </div>
                </div>
                <div className="address-box">
                  <i className="bi bi-geo-alt"></i>
                  <div>
                    <span className="address-label">Delivery Address</span>
                    <p className="address-text">{order.customer.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Special Instructions Card */}
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="card-header">
                <i className="bi bi-sticky"></i>
                <h3>Special Instructions</h3>
              </div>
              <div className="card-content">
                <div className="instructions-box">
                  <i className="bi bi-info-circle"></i>
                  <p>{order.instructions}</p>
                </div>
              </div>
            </motion.div>

            {/* Order Timeline Card */}
            <motion.div
              className="info-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="card-header">
                <i className="bi bi-clock-history"></i>
                <h3>Order Timeline</h3>
              </div>
              <div className="card-content">
                <div className="timeline">
                  {order.timeline.map((item, index) => (
                    <div key={index} className={`timeline-item ${item.completed ? 'completed' : 'pending'}`}>
                      <div className="timeline-marker">
                        {item.completed ? (
                          <i className="bi bi-check-lg"></i>
                        ) : (
                          <i className="bi bi-circle"></i>
                        )}
                      </div>
                      <div className="timeline-content">
                        <span className="timeline-date">{item.date}</span>
                        <h4 className="timeline-title">{item.title}</h4>
                        <p className="timeline-desc">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Contact Button */}
            <motion.button
              className="btn-contact"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <i className="bi bi-telephone"></i>
              Contact Customer
            </motion.button>
          </div>

          {/* Right Column - Sidebar */}
          <div className="sidebar-column">
            {/* Current Status Card */}
            <motion.div
              className="sidebar-card status-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="status-header">
                <h3>Current Status</h3>
                <div className="status-indicator accepted">
                  <i className="bi bi-check-circle-fill"></i>
                  {order.status}
                </div>
              </div>
              <p className="status-updated">
                <i className="bi bi-clock"></i>
                Status updated on<br />{order.statusUpdated}
              </p>
            </motion.div>

            {/* Delivery Info Card */}
            <motion.div
              className="sidebar-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="sidebar-header">
                <i className="bi bi-truck"></i>
                <h3>Delivery Information</h3>
              </div>
              <div className="sidebar-content">
                <div className="detail-row">
                  <span className="detail-label">Delivery Method</span>
                  <span className="detail-value">{order.delivery.method}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Estimated Delivery</span>
                  <span className="detail-value highlight">{order.delivery.estimated}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Tracking Number</span>
                  <a href="#" className="tracking-link">{order.delivery.tracking}</a>
                </div>
              </div>
            </motion.div>

            {/* Payment Details Card */}
            <motion.div
              className="sidebar-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="sidebar-header">
                <i className="bi bi-credit-card"></i>
                <h3>Payment Details</h3>
              </div>
              <div className="sidebar-content">
                <div className="detail-row">
                  <span className="detail-label">Payment Method</span>
                  <span className="detail-value">{order.payment.method}</span>
                </div>
                <div className="payment-breakdown">
                  <div className="payment-row">
                    <span>Subtotal</span>
                    <span>${order.payment.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="payment-row">
                    <span>Shipping</span>
                    <span>${order.payment.shipping.toFixed(2)}</span>
                  </div>
                  <div className="payment-row">
                    <span>Tax</span>
                    <span>${order.payment.tax.toFixed(2)}</span>
                  </div>
                  <div className="payment-row total">
                    <span>Total</span>
                    <span>${order.payment.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="action-buttons"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <button className="btn-primary-action">
                <i className="bi bi-printer"></i>
                Print Order Details
              </button>
              <button className="btn-secondary-action">
                <i className="bi bi-download"></i>
                Download Invoice
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .order-status-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%);
          font-family: 'Inter', sans-serif;
        }

        /* Back Link */
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: white;
          border-radius: 10px;
          color: #92400e;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 1.5rem;
          border: 2px solid #fde68a;
          transition: all 0.3s ease;
        }

        .back-link:hover {
          background: #fef9c3;
          color: #78350f;
          transform: translateX(-4px);
        }

        /* Header */
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 2rem;
          padding: 1.5rem 2rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.25);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          color: white;
          backdrop-filter: blur(10px);
        }

        .order-title {
          font-size: 1.875rem;
          font-weight: 700;
          color: white;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .order-id-text {
          color: rgba(255, 255, 255, 0.9);
          margin: 0.25rem 0 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .status-badge-large {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 12px;
          color: #047857;
          font-weight: 700;
          font-size: 1rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .status-badge-large i {
          font-size: 1.25rem;
        }

        /* Content Grid */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Info Cards */
        .info-card {
          background: white;
          border-radius: 16px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #fef3c7;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border-bottom: 2px solid #fde68a;
        }

        .card-header i {
          font-size: 1.25rem;
          color: #d97706;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #78350f;
          margin: 0;
        }

        .card-content {
          padding: 1.5rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        @media (max-width: 576px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
        }

        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .info-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .info-value {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
        }

        .info-value.highlight {
          color: #d97706;
        }

        /* Product Display */
        .product-display {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #fffbeb;
          border-radius: 12px;
          border: 2px solid #fde68a;
        }

        .product-image {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid #fbbf24;
        }

        .product-details h4 {
          font-size: 1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.5rem;
        }

        .quantity-badge {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          color: white;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Address Box */
        .address-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: #fffbeb;
          border-radius: 12px;
          border: 2px solid #fde68a;
        }

        .address-box i {
          font-size: 1.25rem;
          color: #d97706;
          flex-shrink: 0;
        }

        .address-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #92400e;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .address-text {
          margin: 0.375rem 0 0;
          color: #374151;
          line-height: 1.5;
        }

        /* Instructions Box */
        .instructions-box {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
          border-radius: 12px;
          border-left: 4px solid #fbbf24;
        }

        .instructions-box i {
          font-size: 1.25rem;
          color: #92400e;
          flex-shrink: 0;
        }

        .instructions-box p {
          margin: 0;
          color: #78350f;
          line-height: 1.6;
        }

        /* Timeline */
        .timeline {
          position: relative;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          padding-bottom: 1.5rem;
          position: relative;
        }

        .timeline-item:last-child {
          padding-bottom: 0;
        }

        .timeline-item:not(:last-child)::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 40px;
          bottom: 0;
          width: 2px;
          background: #fde68a;
        }

        .timeline-item.completed:not(:last-child)::before {
          background: #10b981;
        }

        .timeline-marker {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 0.875rem;
        }

        .timeline-item.completed .timeline-marker {
          background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
          color: white;
        }

        .timeline-item.pending .timeline-marker {
          background: #fef9c3;
          color: #d97706;
          border: 2px solid #fde68a;
        }

        .timeline-content {
          flex: 1;
        }

        .timeline-date {
          font-size: 0.8rem;
          font-weight: 600;
          color: #92400e;
        }

        .timeline-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0.25rem 0;
        }

        .timeline-desc {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* Contact Button */
        .btn-contact {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: white;
          border: 2px solid #fbbf24;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #92400e;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-contact:hover {
          background: #fef9c3;
          transform: translateY(-2px);
        }

        /* Sidebar Cards */
        .sidebar-card {
          background: white;
          border-radius: 16px;
          margin-bottom: 1.25rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #fef3c7;
          overflow: hidden;
        }

        .status-card {
          padding: 1.5rem;
          background: linear-gradient(135deg, #fffbeb 0%, white 100%);
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .status-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #78350f;
          margin: 0;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 700;
        }

        .status-indicator.accepted {
          background: #d1fae5;
          color: #047857;
        }

        .status-updated {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
        }

        .status-updated i {
          color: #fbbf24;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #fffbeb 0%, #fef9c3 100%);
          border-bottom: 2px solid #fde68a;
        }

        .sidebar-header i {
          font-size: 1.25rem;
          color: #d97706;
        }

        .sidebar-header h3 {
          font-size: 1rem;
          font-weight: 700;
          color: #78350f;
          margin: 0;
        }

        .sidebar-content {
          padding: 1.25rem;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.625rem 0;
          border-bottom: 1px solid #fef3c7;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          font-size: 0.875rem;
          color: #6b7280;
        }

        .detail-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
        }

        .detail-value.highlight {
          color: #d97706;
        }

        .tracking-link {
          font-size: 0.9rem;
          font-weight: 600;
          color: #d97706;
          text-decoration: none;
        }

        .tracking-link:hover {
          text-decoration: underline;
        }

        /* Payment Breakdown */
        .payment-breakdown {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 2px dashed #fde68a;
        }

        .payment-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .payment-row.total {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 2px solid #fde68a;
          font-size: 1.1rem;
          font-weight: 700;
          color: #047857;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .btn-primary-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(251, 191, 36, 0.35);
        }

        .btn-primary-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(251, 191, 36, 0.45);
        }

        .btn-secondary-action {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background: white;
          border: 2px solid #fde68a;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          color: #92400e;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary-action:hover {
          background: #fef9c3;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }

          .header-content {
            flex-direction: column;
          }

          .status-badge-large {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderStatus;
