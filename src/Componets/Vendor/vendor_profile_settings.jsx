import React, { useState, useEffect } from "react";
import "./vendor_settings.css";
import axios from "axios";

function VendorProfileSettings() {
  const [formData, setFormData] = useState({
    Business_Name: "",
    Owner_name: "",
    Email_address: "",
    Phone_number: "",
    Business_address: "",
    Category: "",
    Sub_Category: [],
    Tax_ID: "",
    Password: "",
    Latitude: "",
    Longitude: "",
    ID_Type: "PAN",
    Account_Number: "",
    IFSC_Code: "",
    Charge_Type: "Day",
    Charge_Per_Hour_or_Day: "",
    description: "",
  });
  const [profilePic, setProfilePic] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const id = localStorage.getItem("vendorId");

  // Auto-fetch location
  useEffect(() => {
    if (!formData.Latitude || !formData.Longitude || !formData.Business_address) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = "";

          try {
            const osmRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            if (osmRes.data && osmRes.data.display_name) {
              address = osmRes.data.display_name;
            }
          } catch (err) {
            address = "";
          }

          setFormData((prev) => ({
            ...prev,
            Latitude: lat,
            Longitude: lng,
            Business_address: address,
          }));
        });
      }
    }
  }, []);

  // Fetch vendor data
  useEffect(() => {
    if (id) {
      axios
        .get(`https://backend-d6mx.vercel.app/${id}/settings`)
        .then((res) => {
          const data = res.data?.datasettings || {};
          setFormData({
            Business_Name: data.Business_Name || "",
            Owner_name: data.Owner_name || "",
            Email_address: data.Email_address || "",
            Phone_number: data.Phone_number || "",
            Business_address: data.Business_address || "",
            Category: data.Category || "",
            Sub_Category: Array.isArray(data.Sub_Category)
              ? data.Sub_Category
              : typeof data.Sub_Category === "string"
              ? data.Sub_Category.split(",")
              : [],
            Tax_ID: data?.Tax_ID || "",
            Password: data?.Password || "",
            Latitude: data?.Latitude || "",
            Longitude: data?.Longitude || "",
            ID_Type: data?.ID_Type || "PAN",
            Account_Number: data?.Account_Number || "",
            IFSC_Code: data?.IFSC_Code || "",
            Charge_Type: data?.Charge_Type || "Day",
            Charge_Per_Hour_or_Day: data?.Charge_Per_Hour_or_Day || "",
            description: data?.description || "",
          });
        })
        .catch((err) => console.error("Failed to fetch vendor data", err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "Sub_Category"
          ? value.split(",").map((s) => s.trim())
          : value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const sendData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          sendData.append(key, formData[key].join(","));
        } else {
          sendData.append(key, formData[key]);
        }
      });
      if (profilePic) sendData.append("profileImage", profilePic);
      if (imageFiles.length > 0)
        imageFiles.forEach((file) => sendData.append("productImages", file));

      await axios.put(
        `https://backend-d6mx.vercel.app/update/userdetailes/${id}`,
        sendData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Changes saved successfully");
    } catch (err) {
      console.error("Failed to save changes", err);
      alert("Failed to save changes");
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: "900px" }}>
      <h3 className="fw-bold mb-4 text-dark">Account Settings</h3>

      {/* Profile Information */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">Profile Information</h5>
            <small className="text-muted">
              Basic details about your business
            </small>
          </div>
          <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill">
            ✓ Complete
          </span>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Business Name</label>
              <input
                className="form-control"
                name="Business_Name"
                value={formData.Business_Name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Owner Name</label>
              <input
                className="form-control"
                name="Owner_name"
                value={formData.Owner_name}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Email Address</label>
              <input
                type="email"
                className="form-control"
                name="Email_address"
                value={formData.Email_address}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Phone Number</label>
              <input
                className="form-control"
                name="Phone_number"
                value={formData.Phone_number}
                onChange={handleChange}
              />
            </div>
            <div className="col-12">
              <label className="form-label fw-semibold">Business Address</label>
              <textarea
                className="form-control"
                rows={2}
                name="Business_address"
                value={formData.Business_address}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bank & Tax Details */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0 fw-semibold">Bank & Tax Details</h5>
            <small className="text-muted">
              Financial information for payments and tax purposes
            </small>
          </div>
          <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill">
            ⚠ Incomplete
          </span>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Tax ID</label>
              <input
                className="form-control"
                name="Tax_ID"
                value={formData.Tax_ID}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">ID Type</label>
              <select
                className="form-select"
                name="ID_Type"
                value={formData.ID_Type}
                onChange={handleChange}
              >
                <option value="PAN">PAN</option>
                <option value="Aadhar">Aadhar</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Account Number</label>
              <input
                className="form-control"
                name="Account_Number"
                value={formData.Account_Number}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">IFSC Code</label>
              <input
                className="form-control"
                name="IFSC_Code"
                value={formData.IFSC_Code}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="alert alert-primary mt-4 mb-0 small">
            <i className="bi bi-info-circle me-2"></i>
            Your banking information is encrypted and securely stored.
          </div>
        </div>
      </div>

      {/* Description & Charges */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-semibold">Charges & Description</h5>
          <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill">
            ⏳ In Progress
          </span>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Charge Type</label>
              <select
                className="form-select"
                name="Charge_Type"
                value={formData.Charge_Type}
                onChange={handleChange}
              >
                <option value="Day">Per Day</option>
                <option value="Hour">Per Hour</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">
                Charge Amount
              </label>
              <input
                className="form-control"
                type="number"
                name="Charge_Per_Hour_or_Day"
                value={formData.Charge_Per_Hour_or_Day}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label fw-semibold">
              Service Description
            </label>
            <textarea
              className="form-control"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="text-end">
        <button
          className="btn text-white fw-semibold px-4 py-2"
          style={{
            backgroundColor: "#F4B400",
            borderRadius: "8px",
            fontSize: "1rem",
          }}
          onClick={handleSaveChanges}
        >
          <i className="bi bi-save me-2"></i> Save Changes
        </button>
      </div>
    </div>
  );
}

export default VendorProfileSettings;
