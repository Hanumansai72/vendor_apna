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

      <div className="bulk-upload-container">
        {/* Header */}
        <motion.div
          className="page-header-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="header-content">
            <div className="header-icon">
              <i className="bi bi-cloud-arrow-up-fill"></i>
            </div>
            <div className="header-text">
              <h1 className="page-title">Bulk Product Upload</h1>
              <p className="page-subtitle">Upload multiple products at once using CSV</p>
            </div>
          </div>
          <Link to={`/vendor/${vendorId}/products/add`} className="btn-add-single">
            <i className="bi bi-plus-lg"></i>
            <span>Add Single Product</span>
          </Link>
        </motion.div>

        <div className="row g-4">
          {/* Upload Section */}
          <div className="col-lg-8">
            {/* Upload Zone */}
            <motion.div
              className={`upload-zone-card ${isDragging ? 'dragging' : ''} ${file ? 'has-file' : ''}`}
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
                <div className="file-info-wrapper">
                  <div className="file-icon-box">
                    <i className="bi bi-file-earmark-spreadsheet"></i>
                  </div>
                  <div className="file-details">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{(file.size / 1024).toFixed(2)} KB</span>
                  </div>
                  <button className="btn-remove-file" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ) : (
                <div className="upload-content">
                  <div className="upload-icon-wrapper">
                    <i className="bi bi-cloud-arrow-up"></i>
                    <div className="upload-pulse"></div>
                  </div>
                  <h4 className="upload-title">Drag & drop your CSV file here</h4>
                  <p className="upload-text">or click to browse</p>
                  <span className="upload-hint">Supports .csv files up to 10MB</span>
                  <button type="button" className="btn-browse">
                    <i className="bi bi-folder2-open"></i>
                    Browse Files
                  </button>
                </div>
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
                  <div className="preview-title">
                    <i className="bi bi-table"></i>
                    <h5>Preview ({preview.length} products)</h5>
                  </div>
                  <span className={`validation-badge ${preview.every(p => p.status === 'Valid') ? 'valid' : 'warning'}`}>
                    <i className={`bi ${preview.every(p => p.status === 'Valid') ? 'bi-check-circle' : 'bi-exclamation-triangle'}`}></i>
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
                          <td>
                            <span className="product-name">{item.name}</span>
                          </td>
                          <td>
                            <span className="category-tag">{item.category}</span>
                          </td>
                          <td>{item.price || <span className="text-missing">Missing</span>}</td>
                          <td>{item.stock}</td>
                          <td>
                            <span className={`status-pill ${item.status === 'Valid' ? 'valid' : 'warning'}`}>
                              <i className={`bi ${item.status === 'Valid' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="preview-actions">
                  <button className="btn-clear" onClick={clearFile}>
                    <i className="bi bi-trash3"></i>
                    Clear
                  </button>
                  <button
                    className="btn-upload"
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
                        <i className="bi bi-check-lg"></i>
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
              className="sidebar-card template-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="sidebar-icon">
                <i className="bi bi-file-earmark-arrow-down"></i>
              </div>
              <h6 className="sidebar-title">Download Template</h6>
              <p className="sidebar-text">Use our CSV template to ensure correct formatting</p>
              <button className="btn-download">
                <i className="bi bi-download"></i>
                Download CSV Template
              </button>
            </motion.div>

            {/* Instructions */}
            <motion.div
              className="sidebar-card instructions-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="sidebar-header">
                <i className="bi bi-lightbulb"></i>
                <h6>Instructions</h6>
              </div>
              <ol className="instructions-list">
                <li>
                  <span className="step-number">1</span>
                  <span>Download the CSV template</span>
                </li>
                <li>
                  <span className="step-number">2</span>
                  <span>Fill in your product details</span>
                </li>
                <li>
                  <span className="step-number">3</span>
                  <span>Upload the completed file</span>
                </li>
                <li>
                  <span className="step-number">4</span>
                  <span>Review the preview</span>
                </li>
                <li>
                  <span className="step-number">5</span>
                  <span>Click "Upload Products"</span>
                </li>
              </ol>
            </motion.div>

            {/* Required Fields */}
            <motion.div
              className="sidebar-card fields-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sidebar-header">
                <i className="bi bi-list-check"></i>
                <h6>Required Fields</h6>
              </div>
              <div className="field-tags">
                <span className="field-tag required">
                  <i className="bi bi-asterisk"></i>
                  Product Name
                </span>
                <span className="field-tag required">
                  <i className="bi bi-asterisk"></i>
                  Category
                </span>
                <span className="field-tag required">
                  <i className="bi bi-asterisk"></i>
                  Price
                </span>
                <span className="field-tag required">
                  <i className="bi bi-asterisk"></i>
                  Stock
                </span>
                <span className="field-tag optional">
                  <i className="bi bi-dash"></i>
                  Description
                </span>
                <span className="field-tag optional">
                  <i className="bi bi-dash"></i>
                  Image URL
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        /* =============================================
           Bulk Upload Page - Yellow & White Theme
           ============================================= */
        
        .bulk-upload-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFBEB 0%, #FEF9C3 50%, #FFFFFF 100%);
        }

        .bulk-upload-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Page Header */
        .page-header-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #FDE68A;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.35);
        }

        .header-icon i {
          font-size: 1.5rem;
          color: #1a1a1a;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1a1a1a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          color: #6b7280;
          margin: 0.25rem 0 0;
          font-size: 0.95rem;
        }

        .btn-add-single {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-weight: 600;
          color: #374151;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-add-single:hover {
          border-color: #FFD600;
          background: #FFFBEB;
          color: #1a1a1a;
        }

        /* Upload Zone */
        .upload-zone-card {
          background: #ffffff;
          border: 2px dashed #FDE68A;
          border-radius: 20px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .upload-zone-card:hover,
        .upload-zone-card.dragging {
          border-color: #FFD600;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          box-shadow: 0 8px 24px rgba(255, 214, 0, 0.15);
        }

        .upload-zone-card.has-file {
          cursor: default;
          padding: 1.5rem 2rem;
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
          width: 88px;
          height: 88px;
          margin-bottom: 1.25rem;
        }

        .upload-icon-wrapper i {
          font-size: 2.5rem;
          color: #D4A200;
          position: relative;
          z-index: 1;
          line-height: 88px;
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

        .upload-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.375rem;
        }

        .upload-text {
          color: #6b7280;
          margin-bottom: 0.375rem;
        }

        .upload-hint {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-bottom: 1.25rem;
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

        /* File Info */
        .file-info-wrapper {
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }

        .file-icon-box {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: #ffffff;
        }

        .file-details {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .file-name {
          font-weight: 700;
          color: #1a1a1a;
          font-size: 1rem;
        }

        .file-size {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .btn-remove-file {
          width: 40px;
          height: 40px;
          border: none;
          background: #FEE2E2;
          border-radius: 10px;
          color: #dc2626;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-remove-file:hover {
          background: #FECACA;
          transform: scale(1.05);
        }

        /* Preview Card */
        .preview-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          background: #FEFCE8;
        }

        .preview-title {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        .preview-title i {
          font-size: 1.25rem;
          color: #D4A200;
        }

        .preview-title h5 {
          margin: 0;
          font-weight: 700;
          color: #1a1a1a;
        }

        .validation-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.875rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .validation-badge.valid {
          background: #DCFCE7;
          color: #16a34a;
        }

        .validation-badge.warning {
          background: #FEF3C7;
          color: #d97706;
        }

        .preview-table {
          width: 100%;
          border-collapse: collapse;
        }

        .preview-table th {
          background: #f9fafb;
          padding: 1rem 1.25rem;
          text-align: left;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .preview-table td {
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.9rem;
          color: #374151;
        }

        .preview-table tr:hover {
          background: #FFFBEB;
        }

        .product-name {
          font-weight: 600;
          color: #1a1a1a;
        }

        .category-tag {
          background: #FEF3C7;
          color: #92400E;
          padding: 0.25rem 0.625rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .text-missing {
          color: #dc2626;
          font-weight: 500;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-pill.valid {
          background: #DCFCE7;
          color: #16a34a;
        }

        .status-pill.warning {
          background: #FEE2E2;
          color: #dc2626;
        }

        .preview-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          border-top: 1px solid #f3f4f6;
          background: #f9fafb;
        }

        .btn-clear {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          color: #6b7280;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-clear:hover {
          border-color: #dc2626;
          color: #dc2626;
          background: #FEF2F2;
        }

        .btn-upload {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 10px;
          color: #1a1a1a;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .btn-upload:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        .btn-upload:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(26, 26, 26, 0.2);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Sidebar Cards */
        .sidebar-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .template-card {
          border-color: #FDE68A;
          background: linear-gradient(135deg, #FFFBEB 0%, #ffffff 100%);
        }

        .sidebar-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.375rem;
          color: #1a1a1a;
          margin-bottom: 1rem;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.25);
        }

        .sidebar-title {
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
          font-size: 1rem;
        }

        .sidebar-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 1.25rem;
        }

        .btn-download {
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 12px;
          color: #1a1a1a;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .btn-download:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .sidebar-header i {
          color: #D4A200;
          font-size: 1.125rem;
        }

        .sidebar-header h6 {
          margin: 0;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* Instructions */
        .instructions-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .instructions-list li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0;
          font-size: 0.875rem;
          color: #374151;
          border-bottom: 1px solid #f3f4f6;
        }

        .instructions-list li:last-child {
          border-bottom: none;
        }

        .step-number {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #1a1a1a;
          flex-shrink: 0;
        }

        /* Field Tags */
        .field-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .field-tag {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .field-tag.required {
          background: #FEF3C7;
          color: #92400E;
        }

        .field-tag.required i {
          font-size: 0.5rem;
          color: #dc2626;
        }

        .field-tag.optional {
          background: #f3f4f6;
          color: #6b7280;
        }

        /* Responsive */
        @media (max-width: 992px) {
          .page-header-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-single {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .bulk-upload-container {
            padding: 1rem;
          }

          .upload-zone-card {
            padding: 2rem 1rem;
          }

          .file-info-wrapper {
            flex-wrap: wrap;
          }

          .preview-actions {
            flex-direction: column;
          }

          .btn-clear,
          .btn-upload {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default BulkProductUpload;
