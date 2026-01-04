import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import API_BASE_URL from "../../config";
import { useAuth } from "../Auth/AuthContext";
import ProductNavbar from "./productnav";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const JobProgress = () => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const { user: authUser } = useAuth();
  const currentVendorId = authUser?.id;
  const jobId = localStorage.getItem("JObid");
  const navigate = useNavigate();

  useEffect(() => {
    if (currentVendorId) {
      axios.get(`${API_BASE_URL}/services/jobs/${currentVendorId}`)
        .then(res => {
          setJob(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching jobs:', err);
          setLoading(false);
        });
    }
  }, [currentVendorId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setUploadedImage(null);
    setImagePreview(null);
  };

  const handleMarkCompleted = async () => {
    if (!uploadedImage) return;

    setSubmitting(true);
    try {
      await axios.put(`${API_BASE_URL}/api/bookings/${jobId}/status`, {
        status: "Completed"
      });

      navigate(`/vendor/Payment/sucess`);
    } catch (error) {
      console.error("Error marking job as completed:", error);
      alert("Failed to update status. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = job?.serviceDate
    ? new Date(job.serviceDate).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';

  return (
    <div className="job-progress-page">
      <ProductNavbar />

      <div className="job-progress-container">
        {/* Success Alert */}
        <motion.div
          className="arrival-alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="alert-icon">
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <div className="alert-content">
            <h4>Arrival Confirmed!</h4>
            <p>You've reached the service location. You can now proceed with the service.</p>
          </div>
        </motion.div>

        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading job details...</p>
          </div>
        ) : (
          <>
            {/* Job Summary Card */}
            <motion.div
              className="summary-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="card-header">
                <div className="header-icon">
                  <i className="bi bi-clipboard-check-fill"></i>
                </div>
                <h3>Job Summary</h3>
              </div>

              <div className="summary-grid">
                <div className="summary-item">
                  <div className="item-icon">
                    <i className="bi bi-tools"></i>
                  </div>
                  <div className="item-content">
                    <span className="item-label">Service Type</span>
                    <span className="item-value">Plumbing Repair</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="item-icon">
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div className="item-content">
                    <span className="item-label">Client</span>
                    <span className="item-value">{job?.customer?.fullName || "Customer"}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="item-icon">
                    <i className="bi bi-geo-alt-fill"></i>
                  </div>
                  <div className="item-content">
                    <span className="item-label">Address</span>
                    <span className="item-value">{job?.address?.street || "Service Location"}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="item-icon">
                    <i className="bi bi-calendar-event-fill"></i>
                  </div>
                  <div className="item-content">
                    <span className="item-label">Scheduled Time</span>
                    <span className="item-value">{formattedDate} • {job?.serviceTime || "N/A"}</span>
                  </div>
                </div>

                <div className="summary-item">
                  <div className="item-icon">
                    <i className="bi bi-clock-fill"></i>
                  </div>
                  <div className="item-content">
                    <span className="item-label">Estimated Duration</span>
                    <span className="item-value">2 hours</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Upload Work Image Card */}
            <motion.div
              className="upload-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="card-header">
                <div className="header-icon upload">
                  <i className="bi bi-camera-fill"></i>
                </div>
                <div>
                  <h3>Upload Work Image</h3>
                  <p>Please upload an image of the completed work before marking the job as completed.</p>
                </div>
              </div>

              <div
                className={`upload-zone ${uploadedImage ? 'has-image' : ''}`}
                onClick={!uploadedImage ? handleUploadClick : undefined}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />

                {uploadedImage ? (
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Work preview" className="image-preview" />
                    <div className="image-overlay">
                      <div className="image-info">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>{uploadedImage.name}</span>
                      </div>
                      <button className="btn-remove-image" onClick={removeImage}>
                        <i className="bi bi-trash3-fill"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="upload-content">
                    <div className="upload-icon-wrapper">
                      <i className="bi bi-cloud-arrow-up-fill"></i>
                      <div className="upload-pulse"></div>
                    </div>
                    <h5>Drag and drop or click to upload</h5>
                    <p>Supports JPG, JPEG, PNG files</p>
                    <button type="button" className="btn-browse">
                      <i className="bi bi-folder2-open"></i>
                      Choose File
                    </button>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              className="action-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <button
                className={`btn-complete ${!uploadedImage ? 'disabled' : ''}`}
                disabled={!uploadedImage || submitting}
                onClick={handleMarkCompleted}
              >
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill"></i>
                    Mark as Completed
                  </>
                )}
              </button>
              {!uploadedImage && (
                <p className="action-hint">
                  <i className="bi bi-info-circle"></i>
                  Please upload a work image to complete this job
                </p>
              )}
            </motion.div>
          </>
        )}
      </div>

      <style>{`
        /* =============================================
           Job Progress Page - Yellow & White Theme
           ============================================= */
        
        .job-progress-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFBEB 0%, #FEF9C3 50%, #FFFFFF 100%);
        }

        .job-progress-container {
          max-width: 700px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Arrival Alert */
        .arrival-alert {
          background: linear-gradient(135deg, #22C55E 0%, #16A34A 100%);
          border-radius: 20px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 8px 24px rgba(34, 197, 94, 0.3);
        }

        .alert-icon {
          width: 56px;
          height: 56px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .alert-icon i {
          font-size: 1.75rem;
          color: #ffffff;
        }

        .alert-content h4 {
          margin: 0 0 0.25rem;
          font-weight: 700;
          color: #ffffff;
          font-size: 1.25rem;
        }

        .alert-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.9);
          font-size: 0.9rem;
        }

        /* Loading State */
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .spinner-large {
          width: 48px;
          height: 48px;
          border: 4px solid #FDE68A;
          border-top-color: #FFD600;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        .loading-state p {
          color: #6b7280;
          font-weight: 500;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Summary Card */
        .summary-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #FDE68A;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .header-icon i {
          font-size: 1.25rem;
          color: #1a1a1a;
        }

        .header-icon.upload {
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .header-icon.upload i {
          color: #ffffff;
        }

        .card-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
        }

        .card-header p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Summary Grid */
        .summary-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .summary-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #FEFCE8;
          border-radius: 14px;
          transition: all 0.2s ease;
        }

        .summary-item:hover {
          background: #FEF3C7;
          transform: translateX(4px);
        }

        .item-icon {
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #D4A200;
          font-size: 1.125rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .item-content {
          display: flex;
          flex-direction: column;
        }

        .item-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .item-value {
          font-size: 0.95rem;
          color: #1a1a1a;
          font-weight: 600;
        }

        /* Upload Card */
        .upload-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
        }

        .upload-zone {
          border: 2px dashed #FDE68A;
          border-radius: 16px;
          padding: 2.5rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 100%);
        }

        .upload-zone:hover:not(.has-image) {
          border-color: #FFD600;
          background: #FEF3C7;
        }

        .upload-zone.has-image {
          padding: 0;
          cursor: default;
          overflow: hidden;
          border-style: solid;
          background: #ffffff;
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .upload-icon-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 1rem;
        }

        .upload-icon-wrapper i {
          font-size: 2.5rem;
          color: #D4A200;
          position: relative;
          z-index: 1;
          line-height: 80px;
        }

        .upload-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          opacity: 0.25;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.85); opacity: 0.25; }
          50% { transform: scale(1.05); opacity: 0.4; }
        }

        .upload-content h5 {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .upload-content p {
          color: #6b7280;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .btn-browse {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .btn-browse:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        /* Image Preview */
        .image-preview-container {
          position: relative;
        }

        .image-preview {
          width: 100%;
          height: 250px;
          object-fit: cover;
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .image-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #ffffff;
          font-weight: 500;
        }

        .image-info i {
          color: #22C55E;
        }

        .btn-remove-image {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          color: #ffffff;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-remove-image:hover {
          background: rgba(220, 38, 38, 0.8);
          border-color: transparent;
        }

        /* Action Section */
        .action-section {
          text-align: center;
        }

        .btn-complete {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.625rem;
          padding: 1rem 2.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 16px;
          font-size: 1.1rem;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 8px 24px rgba(255, 214, 0, 0.35);
          min-width: 260px;
        }

        .btn-complete:hover:not(.disabled):not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(255, 214, 0, 0.45);
        }

        .btn-complete.disabled,
        .btn-complete:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          box-shadow: none;
          cursor: not-allowed;
        }

        .btn-complete .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(26, 26, 26, 0.2);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .action-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .action-hint i {
          color: #D4A200;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .job-progress-container {
            padding: 1rem;
          }

          .arrival-alert {
            flex-direction: column;
            text-align: center;
          }

          .summary-item {
            padding: 0.875rem;
          }

          .upload-zone:not(.has-image) {
            padding: 2rem 1rem;
          }

          .btn-complete {
            width: 100%;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default JobProgress;
