import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { motion } from "framer-motion";
import Footer from "../Navbar/footer";

const AdminApprovalPending = () => {
  return (
    <>
      <div className="container my-5">
        {/* --- Top Section --- */}
        <motion.div
          className="text-center p-5 shadow-sm rounded bg-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Rotating Hourglass */}
          <motion.div
            className="mb-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 10 }}
          >
            <motion.div
              className="mx-auto bg-warning d-flex align-items-center justify-content-center rounded-circle shadow"
              style={{ width: "80px", height: "80px" }}
              animate={{ rotate: [0, 360] }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "linear",
              }}
            >
              <i className="bi bi-hourglass-split fs-2 text-white"></i>
            </motion.div>
          </motion.div>

          <h3 className="fw-bold text-dark">Your Profile is Under Admin Approval</h3>
          <p className="text-muted">
            You will be notified once your account is approved and you can access
            all vendor portal features.
          </p>

          {/* --- Progress Bar --- */}
          <motion.div
            className="d-flex justify-content-center align-items-center my-4 position-relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-success fw-semibold me-2">
              <i className="bi bi-check-circle-fill"></i> Profile Submitted
            </div>

            {/* Animated glowing line */}
            <motion.div
              className="mx-2 border-bottom border-2 border-warning"
              style={{ width: "50px" }}
              animate={{
                boxShadow: [
                  "0 0 5px #ffc107",
                  "0 0 15px #ffc107",
                  "0 0 5px #ffc107",
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.2,
                ease: "easeInOut",
              }}
            ></motion.div>

            <motion.div
              className="text-warning fw-semibold me-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <i className="bi bi-eye-fill"></i> Under Review
            </motion.div>

            <div
              className="mx-2 border-bottom border-2 border-secondary"
              style={{ width: "50px" }}
            ></div>
            <div className="text-secondary fw-semibold">
              <i className="bi bi-hand-thumbs-up-fill"></i> Approved
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="mt-4 d-flex justify-content-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="btn btn-warning text-white fw-semibold px-4 shadow-sm"
            >
              <i className="bi bi-envelope-fill me-2"></i>Contact Support
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="btn btn-light border fw-semibold px-4 shadow-sm"
            >
              <i className="bi bi-check2-circle me-2"></i>Check Status
            </motion.button>
          </motion.div>
        </motion.div>

        {/* --- What Happens Next Section --- */}
        <div className="my-5">
          <h4 className="fw-bold text-center mb-4">What Happens Next?</h4>
          <div className="row g-4">
            {[
              {
                title: "Document Review",
                color: "primary",
                icon: "bi-search",
                desc: "Our admin team is carefully reviewing all submitted documents and information for compliance and accuracy.",
              },
              {
                title: "Instant Notification",
                color: "success",
                icon: "bi-bell-fill",
                desc: "You'll receive an email notification immediately once your profile has been approved by our administrators.",
              },
              {
                title: "Full Access",
                color: "purple",
                icon: "bi-rocket-takeoff-fill",
                desc: "Once approved, you'll have complete access to all vendor portal features and can begin managing your account.",
                bg: "#f5e8ff",
              },
            ].map((card, index) => (
              <motion.div
                key={index}
                className="col-md-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.2 }}
              >
                <div
                  className="p-4 rounded text-center shadow-sm h-100"
                  style={{ backgroundColor: card.bg || "var(--bs-light)" }}
                >
                  <motion.div
                    className={`bg-${card.color} text-white mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3`}
                    style={{ width: "60px", height: "60px" }}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 150 }}
                  >
                    <i className={`bi ${card.icon} fs-3`}></i>
                  </motion.div>
                  <h5 className="fw-bold">{card.title}</h5>
                  <p className="text-muted small">{card.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- Recent Activity Section --- */}
        <div className="mt-5">
          <h4 className="fw-bold mb-4 text-center">Recent Activity</h4>
          <div className="timeline position-relative">
            <motion.div
              className="timeline-item p-3 mb-3 rounded shadow-sm bg-light border-start border-4 border-success"
              whileHover={{ scale: 1.02 }}
            >
              <div className="d-flex align-items-center mb-2">
                <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: "35px", height: "35px" }}>
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h6 className="fw-bold mb-0 text-success">Profile Submitted Successfully</h6>
              </div>
              <p className="text-muted small mb-0">
                All required documents have been received and are now under review.
              </p>
              <div className="text-end text-muted small mt-1">2 hours ago</div>
            </motion.div>

            <motion.div
              className="timeline-item p-3 mb-3 rounded shadow-sm bg-light border-start border-4 border-info"
              whileHover={{ scale: 1.02 }}
            >
              <div className="d-flex align-items-center mb-2">
                <div className="bg-info text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: "35px", height: "35px" }}>
                  <i className="bi bi-clock-history"></i>
                </div>
                <h6 className="fw-bold mb-0 text-info">Document Verification Started</h6>
              </div>
              <p className="text-muted small mb-0">
                Our team has begun verifying your submitted documents.
              </p>
              <div className="text-end text-muted small mt-1">1 hour ago</div>
            </motion.div>

            <motion.div
              className="timeline-item p-3 rounded shadow-sm bg-light border-start border-4 border-warning"
              whileHover={{ scale: 1.02 }}
            >
              <div className="d-flex align-items-center mb-2">
                <div className="bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                     style={{ width: "35px", height: "35px" }}>
                  <i className="bi bi-eye-fill"></i>
                </div>
                <h6 className="fw-bold mb-0 text-warning">Admin Review in Progress</h6>
              </div>
              <p className="text-muted small mb-0">
                Your application is currently being reviewed by our admin team.
              </p>
              <div className="text-end text-muted small mt-1">Currently active</div>
            </motion.div>
          </div>
        </div>
        <div>
          <div className="mt-5">

<div className="mt-5">
  <h4 className="fw-bold mb-4 text-center">FAQ’S</h4>

  <div className="accordion" id="vendorFAQ">

    {/* 1. What is Apna Mestri Vendor Portal? */}
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="accordion-item shadow-sm"
    >
      <h2 className="accordion-header" id="faq1">
        <button
          className="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse1"
          aria-expanded="true"
          aria-controls="faqCollapse1"
        >
          <i className="bi bi-info-circle-fill me-2 text-primary"></i>
          What is Apna Mestri Vendor Portal?
        </button>
      </h2>
      <div
        id="faqCollapse1"
        className="accordion-collapse collapse show"
        aria-labelledby="faq1"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          A platform for professionals to receive job requests, manage
          bookings & track earnings.
        </div>
      </div>
    </motion.div>

    {/* 2. How to create an account? */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq2">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse2"
        >
          <i className="bi bi-person-plus-fill me-2 text-success"></i>
          How do I create an account?
        </button>
      </h2>
      <div
        id="faqCollapse2"
        className="accordion-collapse collapse"
        aria-labelledby="faq2"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Visit <strong>partner.apnamestri.com</strong> → Register → Verify OTP →
          Upload documents. Verification takes <strong>24–48 hours</strong>.
        </div>
      </div>
    </motion.div>

    {/* 3. Profile & Verification */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq3">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse3"
        >
          <i className="bi bi-file-earmark-check-fill me-2 text-warning"></i>
          What documents are required for verification?
        </button>
      </h2>
      <div
        id="faqCollapse3"
        className="accordion-collapse collapse"
        aria-labelledby="faq3"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Required:
          <ul>
            <li>Aadhaar/PAN</li>
            <li>Address Proof</li>
            <li>Photo</li>
            <li>Bank Details</li>
          </ul>
          <strong>Common rejection reasons:</strong> blurry documents, mismatched info.
        </div>
      </div>
    </motion.div>

    {/* 4. Job Booking Process */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq4">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse4"
        >
          <i className="bi bi-briefcase-fill me-2 text-danger"></i>
          How do I receive and accept job requests?
        </button>
      </h2>
      <div
        id="faqCollapse4"
        className="accordion-collapse collapse"
        aria-labelledby="faq4"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Jobs arrive via <strong>SMS, notifications,</strong> and <strong>dashboard alerts</strong>.
          Open job → Check details → Accept.
        </div>
      </div>
    </motion.div>

    {/* 5. Payments */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq5">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse5"
        >
          <i className="bi bi-cash-coin me-2 text-success"></i>
          How do I receive payments?
        </button>
      </h2>
      <div
        id="faqCollapse5"
        className="accordion-collapse collapse"
        aria-labelledby="faq5"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Payments are transferred directly to your bank account with
          a <strong>24-hour payout cycle</strong>.
        </div>
      </div>
    </motion.div>

    {/* 6. Ratings */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq6">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse6"
        >
          <i className="bi bi-star-fill me-2 text-warning"></i>
          How do ratings & reviews work?
        </button>
      </h2>
      <div
        id="faqCollapse6"
        className="accordion-collapse collapse"
        aria-labelledby="faq6"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Customers rate you on punctuality, work quality & behaviour.
          You may dispute unfair reviews.
        </div>
      </div>
    </motion.div>

    {/* 7. Customer Interaction */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq7">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse7"
        >
          <i className="bi bi-chat-dots-fill me-2 text-primary"></i>
          How should I interact with customers?
        </button>
      </h2>
      <div
        id="faqCollapse7"
        className="accordion-collapse collapse"
        aria-labelledby="faq7"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Be polite, confirm job details clearly & share before/after photos.
        </div>
      </div>
    </motion.div>

    {/* 8. Technical Issues */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq8">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse8"
        >
          <i className="bi bi-wifi-off me-2 text-danger"></i>
          Jobs are not showing — what should I do?
        </button>
      </h2>
      <div
        id="faqCollapse8"
        className="accordion-collapse collapse"
        aria-labelledby="faq8"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Check network, GPS, notifications. Restart the app if needed.
        </div>
      </div>
    </motion.div>

    {/* 9. Safety */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq9">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse9"
        >
          <i className="bi bi-shield-fill-check me-2 text-success"></i>
          What safety guidelines should I follow?
        </button>
      </h2>
      <div
        id="faqCollapse9"
        className="accordion-collapse collapse"
        aria-labelledby="faq9"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Wear protective gear & follow work-site safety rules.
        </div>
      </div>
    </motion.div>

    {/* 10. Support */}
    <motion.div whileHover={{ scale: 1.02 }} className="accordion-item shadow-sm mt-2">
      <h2 className="accordion-header" id="faq10">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#faqCollapse10"
        >
          <i className="bi bi-headset me-2 text-primary"></i>
          How do I contact support?
        </button>
      </h2>
      <div
        id="faqCollapse10"
        className="accordion-collapse collapse"
        aria-labelledby="faq10"
        data-bs-parent="#vendorFAQ"
      >
        <div className="accordion-body">
          Support options:
          <ul>
            <li>Live Chat</li>
            <li>Call Helpline</li>
            <li>Email</li>
          </ul>
        </div>
      </div>
    </motion.div>

  </div>
</div>

          </div>
        </div>
      </div>


      <Footer />
    </>
  );
};

export default AdminApprovalPending;
