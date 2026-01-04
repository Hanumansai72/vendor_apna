import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import { api } from "../../config";
import Footer from "../Navbar/footer";
import Navbar from "../Navbar/navbar";
import { useAuth } from "../Auth/AuthContext";
import "./Techincal.css";

function VendorProfileSettings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [saving, setSaving] = useState(false);
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
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  // Auto-fetch location
  useEffect(() => {
    if (!formData.Latitude || !formData.Longitude) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = "";
          try {
            const osmRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            if (osmRes.data?.display_name) address = osmRes.data.display_name;
          } catch (err) { /* ignore */ }
          setFormData((prev) => ({
            ...prev,
            Latitude: lat,
            Longitude: lng,
            Business_address: prev.Business_address || address,
          }));
        });
      }
    }
  }, []);

  // Fetch vendor data
  useEffect(() => {
    if (vendorId) {
      api.get(`/${vendorId}/settings`)
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
          if (data.profileImage) setPreviewUrl(data.profileImage);
        })
        .catch((err) => console.error("Failed to fetch vendor data", err));
    }
  }, [vendorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "Sub_Category" ? value.split(",").map((s) => s.trim()) : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
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

      await api.put(`/update/userdetailes/${vendorId}`, sendData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Changes saved successfully!");
    } catch (err) {
      console.error("Failed to save changes", err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: "bi-person" },
    { id: "bank", label: "Bank & Tax", icon: "bi-bank" },
    { id: "services", label: "Services", icon: "bi-tools" },
    { id: "security", label: "Security", icon: "bi-shield-lock" },
  ];

  const initials = (formData.Owner_name || "V").split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <Navbar />
      <div className="settings-page">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="settings-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="page-title">
                <i className="bi bi-gear-fill text-warning me-3"></i>
                Account Settings
              </h1>
              <p className="page-subtitle">Manage your profile and preferences</p>
            </div>
            <Link to={`/vendor/${vendorId}`} className="btn-back">
              <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
            </Link>
          </motion.div>

          <div className="row g-4">
            {/* Sidebar */}
            <div className="col-lg-3">
              {/* Profile Card */}
              <motion.div
                className="profile-card-sidebar"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="profile-avatar-large">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Profile" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <label className="avatar-edit">
                    <i className="bi bi-camera"></i>
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                  </label>
                </div>
                <h5 className="profile-name">{formData.Owner_name || "Vendor"}</h5>
                <p className="profile-business">{formData.Business_Name || "Business Name"}</p>
                <span className="profile-category">{formData.Category || "Category"}</span>
              </motion.div>

              {/* Nav Tabs */}
              <motion.div
                className="settings-nav"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <i className={`bi ${tab.icon}`}></i>
                    <span>{tab.label}</span>
                    <i className="bi bi-chevron-right arrow"></i>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Main Content */}
            <div className="col-lg-9">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <motion.div
                  className="settings-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="section-header-settings">
                    <h4>Profile Information</h4>
                    <p>Basic details about you and your business</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Business Name</label>
                      <input
                        type="text"
                        name="Business_Name"
                        value={formData.Business_Name}
                        onChange={handleChange}
                        placeholder="Your business name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Owner Name</label>
                      <input
                        type="text"
                        name="Owner_name"
                        value={formData.Owner_name}
                        onChange={handleChange}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        name="Email_address"
                        value={formData.Email_address}
                        onChange={handleChange}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="Phone_number"
                        value={formData.Phone_number}
                        onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Business Address</label>
                      <textarea
                        name="Business_address"
                        value={formData.Business_address}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Your complete business address"
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <select name="Category" value={formData.Category} onChange={handleChange}>
                        <option value="">Select Category</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Painting">Painting</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="AC Repair">AC Repair</option>
                        <option value="Cleaning">Cleaning</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Sub Categories</label>
                      <input
                        type="text"
                        name="Sub_Category"
                        value={formData.Sub_Category.join(", ")}
                        onChange={handleChange}
                        placeholder="e.g., Wiring, Switches, Fans"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bank Tab */}
              {activeTab === "bank" && (
                <motion.div
                  className="settings-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="section-header-settings">
                    <h4>Bank & Tax Details</h4>
                    <p>Financial information for payments</p>
                  </div>

                  <div className="info-banner">
                    <i className="bi bi-shield-check"></i>
                    <span>Your banking information is encrypted and securely stored</span>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>ID Type</label>
                      <select name="ID_Type" value={formData.ID_Type} onChange={handleChange}>
                        <option value="PAN">PAN Card</option>
                        <option value="Aadhar">Aadhar Card</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tax ID / {formData.ID_Type} Number</label>
                      <input
                        type="text"
                        name="Tax_ID"
                        value={formData.Tax_ID}
                        onChange={handleChange}
                        placeholder="Enter your ID number"
                      />
                    </div>
                    <div className="form-group">
                      <label>Bank Account Number</label>
                      <input
                        type="text"
                        name="Account_Number"
                        value={formData.Account_Number}
                        onChange={handleChange}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div className="form-group">
                      <label>IFSC Code</label>
                      <input
                        type="text"
                        name="IFSC_Code"
                        value={formData.IFSC_Code}
                        onChange={handleChange}
                        placeholder="e.g., SBIN0001234"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Services Tab */}
              {activeTab === "services" && (
                <motion.div
                  className="settings-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="section-header-settings">
                    <h4>Service & Pricing</h4>
                    <p>Set your rates and service description</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Charge Type</label>
                      <select name="Charge_Type" value={formData.Charge_Type} onChange={handleChange}>
                        <option value="Day">Per Day</option>
                        <option value="Hour">Per Hour</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Charge Amount (₹)</label>
                      <input
                        type="number"
                        name="Charge_Per_Hour_or_Day"
                        value={formData.Charge_Per_Hour_or_Day}
                        onChange={handleChange}
                        placeholder="e.g., 500"
                      />
                    </div>
                    <div className="form-group full-width">
                      <label>Service Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Describe your services, experience, and specialties..."
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === "security" && (
                <motion.div
                  className="settings-section"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="section-header-settings">
                    <h4>Security Settings</h4>
                    <p>Manage your account security</p>
                  </div>

                  <div className="form-grid">
                    <div className="form-group full-width">
                      <label>Change Password</label>
                      <input
                        type="password"
                        name="Password"
                        value={formData.Password}
                        onChange={handleChange}
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>

                  <div className="security-options">
                    <div className="security-item">
                      <div className="security-info">
                        <i className="bi bi-phone"></i>
                        <div>
                          <h6>Two-Factor Authentication</h6>
                          <p>Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <button className="btn-enable">Enable</button>
                    </div>
                    <div className="security-item">
                      <div className="security-info">
                        <i className="bi bi-envelope"></i>
                        <div>
                          <h6>Email Notifications</h6>
                          <p>Get notified about account activity</p>
                        </div>
                      </div>
                      <button className="btn-enabled">Enabled</button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Save Button */}
              <motion.div
                className="save-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <button className="btn-save" onClick={handleSaveChanges} disabled={saving}>
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Save Changes
                    </>
                  )}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <style>{`
        .settings-page {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          color: var(--text-secondary, #4b5563);
          font-size: 0.85rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .btn-back:hover {
          background: var(--primary-light, #FFF8E6);
          border-color: var(--primary, #FFD600);
          color: var(--text-primary, #111827);
        }

        /* Profile Card Sidebar */
        .profile-card-sidebar {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .profile-avatar-large {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          position: relative;
          overflow: hidden;
        }

        .profile-avatar-large img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-avatar-large span {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
        }

        .avatar-edit {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 32px;
          height: 32px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: all 0.2s ease;
        }

        .avatar-edit:hover {
          background: var(--primary, #FFD600);
        }

        .profile-name {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin-bottom: 0.25rem;
        }

        .profile-business {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin-bottom: 0.75rem;
        }

        .profile-category {
          display: inline-block;
          padding: 0.375rem 0.75rem;
          background: var(--primary-light, #FFF8E6);
          color: var(--primary-dark, #E6C200);
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Settings Nav */
        .settings-nav {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
        }

        .nav-tab {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border: none;
          background: transparent;
          color: var(--text-secondary, #4b5563);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .nav-tab:last-child {
          border-bottom: none;
        }

        .nav-tab:hover {
          background: var(--bg-subtle, #f3f4f6);
        }

        .nav-tab.active {
          background: var(--primary-light, #FFF8E6);
          color: var(--text-primary, #111827);
          font-weight: 600;
        }

        .nav-tab .arrow {
          margin-left: auto;
          opacity: 0.5;
        }

        /* Settings Section */
        .settings-section {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .section-header-settings {
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border, #e5e7eb);
        }

        .section-header-settings h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 0.25rem;
        }

        .section-header-settings p {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin: 0;
        }

        .info-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          background: #dbeafe;
          color: #1d4ed8;
          border-radius: 10px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary, #4b5563);
          margin-bottom: 0.5rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 10px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary, #FFD600);
          box-shadow: 0 0 0 3px rgba(255, 214, 0, 0.2);
        }

        /* Security */
        .security-options {
          margin-top: 1.5rem;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 12px;
          margin-bottom: 0.75rem;
        }

        .security-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .security-info i {
          font-size: 1.5rem;
          color: var(--text-muted, #9ca3af);
        }

        .security-info h6 {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }

        .security-info p {
          font-size: 0.8rem;
          color: var(--text-muted, #9ca3af);
          margin: 0;
        }

        .btn-enable {
          padding: 0.5rem 1rem;
          background: var(--bg-subtle, #f3f4f6);
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
        }

        .btn-enabled {
          padding: 0.5rem 1rem;
          background: #dcfce7;
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #166534;
        }

        /* Save Section */
        .save-section {
          margin-top: 1.5rem;
          text-align: right;
        }

        .btn-save {
          display: inline-flex;
          align-items: center;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }

        .btn-save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
        }

        .btn-save:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        @media (max-width: 992px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full-width {
            grid-column: 1;
          }
        }

        @media (max-width: 768px) {
          .settings-nav {
            display: flex;
            flex-wrap: nowrap;
            overflow-x: auto;
            margin-bottom: 1rem;
          }

          .nav-tab {
            flex: 0 0 auto;
            border-bottom: none;
            border-right: 1px solid var(--border, #e5e7eb);
            padding: 0.75rem 1rem;
          }

          .nav-tab .arrow {
            display: none;
          }
        }
      `}</style>
    </>
  );
}

export default VendorProfileSettings;
