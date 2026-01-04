import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "./Techincal.css";

const ProjectUpload = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: "Electrical", icon: "bi-lightning-charge" },
    { value: "Plumbing", icon: "bi-droplet" },
    { value: "Painting", icon: "bi-palette" },
    { value: "Carpentry", icon: "bi-hammer" },
    { value: "AC Repair", icon: "bi-snow" },
    { value: "Cleaning", icon: "bi-stars" },
    { value: "Other", icon: "bi-tools" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vendorId) {
      alert("Please log in to upload projects.");
      return;
    }

    if (!imageFile) {
      alert("Please select an image.");
      return;
    }

    setUploading(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("vendorId", vendorId);
      data.append("image", imageFile);

      await api.post(`/projecteatils/vendor`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Success - navigate to projects
      navigate(`/vendor/viewproject/${vendorId}`);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload project. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="upload-page">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="upload-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="page-title">
                <i className="bi bi-cloud-arrow-up-fill text-warning me-3"></i>
                Upload Project
              </h1>
              <p className="page-subtitle">Showcase your work to attract more customers</p>
            </div>
            <Link to={`/vendor/viewproject/${vendorId}`} className="btn-view-projects">
              <i className="bi bi-folder me-2"></i>
              View My Projects
            </Link>
          </motion.div>

          <div className="row g-4">
            {/* Form Section */}
            <div className="col-lg-7">
              <motion.div
                className="upload-form-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="form-group">
                    <label>
                      <i className="bi bi-type me-2"></i>
                      Project Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Kitchen Renovation Project"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label>
                      <i className="bi bi-tag me-2"></i>
                      Category
                    </label>
                    <div className="category-grid">
                      {categories.map((cat) => (
                        <button
                          type="button"
                          key={cat.value}
                          className={`category-btn ${formData.category === cat.value ? 'active' : ''}`}
                          onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                        >
                          <i className={`bi ${cat.icon}`}></i>
                          <span>{cat.value}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label>
                      <i className="bi bi-card-text me-2"></i>
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe the project, materials used, challenges faced, and results achieved..."
                      rows={5}
                      required
                    />
                    <span className="char-count">{formData.description.length}/500</span>
                  </div>

                  {/* Actions */}
                  <div className="form-actions">
                    <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-upload" disabled={uploading}>
                      {uploading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cloud-upload me-2"></i>
                          Upload Project
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Image Upload Section */}
            <div className="col-lg-5">
              <motion.div
                className="image-upload-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h5>
                  <i className="bi bi-image me-2"></i>
                  Project Image
                </h5>
                <p className="upload-hint">Upload a high-quality image of your completed work</p>

                <div
                  className={`dropzone ${dragActive ? 'active' : ''} ${preview ? 'has-image' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    hidden
                  />

                  <AnimatePresence mode="wait">
                    {preview ? (
                      <motion.div
                        className="preview-container"
                        key="preview"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <img src={preview} alt="Preview" className="preview-image" />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={(e) => { e.stopPropagation(); removeImage(); }}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        className="dropzone-content"
                        key="dropzone"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="dropzone-icon">
                          <i className="bi bi-cloud-arrow-up"></i>
                        </div>
                        <p className="dropzone-text">
                          <strong>Click to upload</strong> or drag and drop
                        </p>
                        <span className="dropzone-hint">PNG, JPG up to 10MB</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tips */}
                <div className="upload-tips">
                  <h6><i className="bi bi-lightbulb me-2"></i>Tips for great photos</h6>
                  <ul>
                    <li>Use good lighting</li>
                    <li>Capture the full scope of work</li>
                    <li>Show before/after if possible</li>
                    <li>Keep image sharp and in focus</li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .upload-page {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn-view-projects {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px;
          color: var(--text-secondary, #4b5563);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-view-projects:hover {
          background: var(--primary-light, #FFF8E6);
          border-color: var(--primary, #FFD600);
          color: var(--text-primary, #111827);
        }

        /* Form Card */
        .upload-form-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary, #FFD600);
          box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.2);
        }

        .char-count {
          display: block;
          text-align: right;
          font-size: 0.75rem;
          color: var(--text-muted, #9ca3af);
          margin-top: 0.375rem;
        }

        /* Category Grid */
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 0.75rem;
        }

        .category-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.375rem;
          padding: 1rem 0.5rem;
          border: 1px solid var(--border, #e5e7eb);
          background: white;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-btn i {
          font-size: 1.25rem;
          color: var(--text-muted, #9ca3af);
        }

        .category-btn span {
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--text-secondary, #4b5563);
        }

        .category-btn:hover {
          border-color: var(--primary, #FFD600);
          background: var(--primary-light, #FFF8E6);
        }

        .category-btn.active {
          border-color: var(--primary, #FFD600);
          background: var(--primary, #FFD600);
        }

        .category-btn.active i,
        .category-btn.active span {
          color: var(--text-primary, #111827);
        }

        /* Form Actions */
        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
        }

        .btn-cancel {
          padding: 0.875rem 1.5rem;
          background: var(--bg-subtle, #f3f4f6);
          border: none;
          border-radius: 12px;
          font-weight: 600;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
        }

        .btn-upload {
          display: inline-flex;
          align-items: center;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border: none;
          border-radius: 12px;
          font-weight: 700;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-upload:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .btn-upload:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Image Upload Card */
        .image-upload-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .image-upload-card h5 {
          font-weight: 600;
          margin: 0 0 0.25rem;
        }

        .upload-hint {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin: 0 0 1rem;
        }

        /* Dropzone */
        .dropzone {
          border: 2px dashed var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dropzone:hover,
        .dropzone.active {
          border-color: var(--primary, #FFD600);
          background: var(--primary-light, #FFF8E6);
        }

        .dropzone-icon {
          width: 80px;
          height: 80px;
          background: var(--bg-subtle, #f3f4f6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
        }

        .dropzone-icon i {
          font-size: 2.5rem;
          color: var(--text-muted, #9ca3af);
        }

        .dropzone-text {
          color: var(--text-secondary, #4b5563);
          margin: 0 0 0.375rem;
        }

        .dropzone-hint {
          font-size: 0.8rem;
          color: var(--text-muted, #9ca3af);
        }

        /* Preview */
        .preview-container {
          position: relative;
          width: 100%;
        }

        .preview-image {
          width: 100%;
          max-height: 250px;
          object-fit: cover;
          border-radius: 12px;
        }

        .remove-image {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 32px;
          height: 32px;
          background: #ef4444;
          border: 3px solid white;
          border-radius: 50%;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .remove-image:hover {
          transform: scale(1.1);
        }

        /* Tips */
        .upload-tips {
          margin-top: 1.5rem;
          padding: 1rem;
          background: var(--bg-subtle, #f3f4f6);
          border-radius: 12px;
        }

        .upload-tips h6 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0 0 0.75rem;
        }

        .upload-tips ul {
          margin: 0;
          padding-left: 1.25rem;
        }

        .upload-tips li {
          font-size: 0.8rem;
          color: var(--text-muted, #9ca3af);
          margin-bottom: 0.25rem;
        }

        @media (max-width: 768px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancel, .btn-upload {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default ProjectUpload;
