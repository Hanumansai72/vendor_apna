import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import Navbar from "./navbar";

const id=localStorage.getItem("vendorId")

const BulkProductUpload = () => {
  const [fileName, setFileName] = useState("");
  const [uploadPreview, setUploadPreview] = useState([]);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFileName(uploadedFile.name);

      // Simulated preview data
      setUploadPreview([
        { status: "Ready", name: "Product A", category: "Tools", price: "$25", stock: "15" },
        { status: "Ready", name: "Product B", category: "Electronics", price: "$75", stock: "5" },
        { status: "Missing Price", name: "Product C", category: "Apparel", price: "-", stock: "10" }
      ]);
    }
  };

  return (
    <div>
      <Navbar
  homeLabel="Home"
  homeUrl={`/Product/${id}`}
  jobsLabel="Products"
  jobsUrl={`/product/${id}/ViewProduct`}
  historyLabel="New Orders"
  historyUrl={`/product/${id}/order`}
  earningsLabel="Order History"
  earningsUrl={`/product/${id}/order/history`}
/>

      <div className="container mt-5 p-4 border rounded shadow-sm">
        <h4 className="mb-4">Bulk Product Upload</h4>

        <div className="row">
          {/* Quick Guide */}
          <div className="col-md-4 mb-3">
            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold">Quick Guide</h6>
              <ol className="ps-3 small">
                <li>Download our CSV template below</li>
                <li>Fill in your product details following the template format</li>
                <li>Upload your completed CSV file</li>
                <li>Review and confirm your upload</li>
              </ol>
              <button className="btn btn-primary w-100">
                📥 Download CSV Template
              </button>
              <p className="text-center mt-2 text-muted small">
                View template structure
              </p>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="col-md-8 mb-3">
            <ul className="nav nav-tabs" id="uploadTabs" role="tablist">
              <li className="nav-item" role="presentation">
                <button className="nav-link active" id="preview-tab" data-bs-toggle="tab" data-bs-target="#preview" type="button" role="tab">
                  Upload Preview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button className="nav-link" id="upload-tab" data-bs-toggle="tab" data-bs-target="#upload" type="button" role="tab">
                  Upload CSV
                </button>
              </li>
            </ul>
            <div className="tab-content border border-top-0 p-3 rounded-bottom" id="uploadTabsContent">
              {/* Upload Preview Tab */}
              <div className="tab-pane fade show active" id="preview" role="tabpanel">
                <table className="table table-sm table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th>Status</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploadPreview.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center text-muted">
                          Upload a CSV file to see preview
                        </td>
                      </tr>
                    ) : (
                      uploadPreview.map((item, index) => (
                        <tr key={index}>
                          <td>{item.status}</td>
                          <td>{item.name}</td>
                          <td>{item.category}</td>
                          <td>{item.price}</td>
                          <td>{item.stock}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Upload CSV Tab */}
              <div className="tab-pane fade" id="upload" role="tabpanel">
                <div className="p-3 bg-light rounded">
                  <label htmlFor="file-upload" className="form-label fw-semibold">
                    Upload Your CSV File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    className="form-control"
                    accept=".csv"
                    onChange={handleFileChange}
                  />
                  <div className="small text-muted mt-2">
                    CSV file up to 10MB <br />
                    {fileName && <strong>Selected: {fileName}</strong>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12 mt-3">
            <div className="alert alert-warning">
              <h6>⚠ Important Notes</h6>
              <ul className="mb-0 small">
                <li>Make sure your CSV follows our template structure</li>
                <li>All required fields must be filled</li>
                <li>Product images should be uploaded separately</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="text-muted small">
            ⏱ Estimated processing time: 2–3 minutes
          </span>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary">Cancel</button>
            <button className="btn btn-primary">Start Upload</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;
