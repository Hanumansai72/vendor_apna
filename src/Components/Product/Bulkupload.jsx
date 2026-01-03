import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const BulkProductUpload = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = (uploadedFile) => {
    setFile(uploadedFile);
    // Simulated preview data
    setPreview([
      { name: "Cement 50kg Bag", category: "Building Materials", price: "₹450", stock: "100", status: "Valid" },
      { name: "Steel Rod 12mm", category: "Construction", price: "₹85", stock: "500", status: "Valid" },
      { name: "Paint White 20L", category: "Paints", price: "₹2,500", stock: "50", status: "Valid" },
      { name: "Power Drill", category: "Tools", price: "", stock: "25", status: "Missing Price" },
      { name: "Safety Helmet", category: "Safety", price: "₹350", stock: "200", status: "Valid" },
    ]);
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      alert("Products uploaded successfully!");
    }, 2000);
  };

  const clearFile = () => {
    setFile(null);
    setPreview([]);
  };

  return (
    <div className="bulk-upload-page">
      <ProductNavbar />

      <div className="container-xl py-4">
        {/* Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">
              <i className="bi bi-cloud-arrow-up-fill text-primary me-3"></i>
              Bulk Product Upload
            </h1>
            <p className="page-subtitle">Upload multiple products at once using CSV</p>
          </div>
          <Link to={`/vendor/${vendorId}/products/add`} className="btn-back">
            <i className="bi bi-plus-lg me-2"></i>
            Add Single Product
          </Link>
        </motion.div>

        <div className="row g-4">
          {/* Upload Section */}
          <div className="col-lg-8">
            {/* Upload Zone */}
            <motion.div
              className={`upload-zone ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !file && fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".csv"
                hidden
              />

              {file ? (
                <div className="file-info">
                  <div className="file-icon">
                    <i className="bi bi-file-earmark-spreadsheet"></i>
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <button className="btn-remove" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ) : (
                <>
                  <div className="upload-icon">
                    <i className="bi bi-cloud-arrow-up"></i>
                  </div>
                  <h5>Drag & drop your CSV file here</h5>
                  <p>or click to browse</p>
                  <span className="upload-hint">Supports .csv files up to 10MB</span>
                </>
              )}
            </motion.div>

            {/* Preview Table */}
            {preview.length > 0 && (
              <motion.div
                className="preview-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="preview-header">
                  <h5><i className="bi bi-table me-2"></i>Preview ({preview.length} products)</h5>
                  <span className={`validation-badge ${preview.every(p => p.status === 'Valid') ? 'valid' : 'warning'}`}>
                    {preview.filter(p => p.status === 'Valid').length}/{preview.length} Valid
                  </span>
                </div>
                <div className="table-responsive">
                  <table className="preview-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((item, i) => (
                        <tr key={i}>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.price || <span className="text-danger">Missing</span>}</td>
                          <td>{item.stock}</td>
                          <td>
                            <span className={`status-pill ${item.status === 'Valid' ? 'valid' : 'warning'}`}>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="preview-actions">
                  <button className="btn-secondary" onClick={clearFile}>
                    <i className="bi bi-trash3 me-2"></i>Clear
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleUpload}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <>
                        <span className="spinner"></span>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Upload Products
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Template Download */}
            <motion.div
              className="sidebar-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="card-icon">
                <i className="bi bi-file-earmark-arrow-down"></i>
              </div>
              <h6>Download Template</h6>
              <p>Use our CSV template to ensure correct formatting</p>
              <button className="btn-download">
                <i className="bi bi-download me-2"></i>
                Download CSV Template
              </button>
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="sidebar-card instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h6><i className="bi bi-info-circle me-2"></i>Instructions</h6>
              <ol>
                <li>Download the CSV template</li>
                <li>Fill in your product details</li>
                <li>Upload the completed file</li>
                <li>Review the preview</li>
                <li>Click "Upload Products"</li>
              </ol>
            </motion.div>

            {/* Required Fields */}
            <motion.div
              className="sidebar-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h6><i className="bi bi-list-check me-2"></i>Required Fields</h6>
              <div className="field-list">
                <span className="field-tag">Product Name</span>
                <span className="field-tag">Category</span>
                <span className="field-tag">Price</span>
                <span className="field-tag">Stock</span>
                <span className="field-tag optional">Description</span>
                <span className="field-tag optional">Image URL</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .bulk-upload-page {
          min-height: 100vh;
          background: #f8fafc;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0;
        }

        .page-subtitle {
          color: #64748b;
          margin: 0.25rem 0 0;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 500;
          color: #475569;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: #f1f5f9;
          color: #1e293b;
        }

        /* Upload Zone */
        .upload-zone {
          background: white;
          border: 2px dashed #cbd5e1;
          border-radius: 16px;
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
        }

        .upload-zone:hover, .upload-zone.dragging {
          border-color: #3b82f6;
          background: #f0f7ff;
        }

        .upload-zone.has-file {
          cursor: default;
          padding: 1.5rem;
        }

        .upload-icon {
          width: 80px;
          height: 80px;
          background: #dbeafe;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 2rem;
          color: #3b82f6;
        }

        .upload-zone h5 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .upload-zone p {
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .upload-hint {
          font-size: 0.8rem;
          color: #94a3b8;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .file-icon {
          width: 56px;
          height: 56px;
          background: #d1fae5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #059669;
        }

        .file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-weight: 600;
          color: #1e293b;
        }

        .file-size {
          font-size: 0.85rem;
          color: #64748b;
        }

        .btn-remove {
          width: 36px;
          height: 36px;
          border: none;
          background: #fee2e2;
          border-radius: 8px;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-remove:hover {
          background: #fecaca;
        }

        /* Preview Card */
        .preview-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .preview-header h5 {
          margin: 0;
          font-weight: 600;
          color: #1e293b;
        }

        .validation-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .validation-badge.valid {
          background: #d1fae5;
          color: #059669;
        }

        .validation-badge.warning {
          background: #fef3c7;
          color: #d97706;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
        }

        .preview-table th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .preview-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
        }

        .status-pill {
          padding: 0.25rem 0.625rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-pill.valid {
          background: #d1fae5;
          color: #059669;
        }

        .status-pill.warning {
          background: #fee2e2;
          color: #dc2626;
        }

        .preview-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .btn-secondary {
          padding: 0.625rem 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #475569;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary {
          padding: 0.625rem 1.25rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid white;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Sidebar Cards */
        .sidebar-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .sidebar-card .card-icon {
          width: 48px;
          height: 48px;
          background: #dbeafe;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          color: #3b82f6;
          margin-bottom: 1rem;
        }

        .sidebar-card h6 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .sidebar-card p {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 1rem;
        }

        .btn-download {
          width: 100%;
          padding: 0.75rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .sidebar-card.instructions ol {
          padding-left: 1.25rem;
          margin: 0;
        }

        .sidebar-card.instructions li {
          font-size: 0.85rem;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .field-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .field-tag {
          padding: 0.25rem 0.75rem;
          background: #dbeafe;
          border-radius: 6px;
          font-size: 0.8rem;
          color: #3b82f6;
        }

        .field-tag.optional {
          background: #f3f4f6;
          color: #64748b;
        }

        @media (max-width: 768px) {
          .upload-zone {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkProductUpload;
