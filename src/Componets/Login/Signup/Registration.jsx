// Registration.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

// Icons (Bootstrap Icons or emoji where appropriate)
const Icon = ({ name, className = "me-2" }) => (
  <i className={`bi ${name} ${className}`} />
);

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine registration type from query ?tab=product | service (default service)
  const getRegistrationType = () =>
    new URLSearchParams(location.search).get("tab") === "product"
      ? "Product"
      : "Service";

  const [registrationType] = useState(getRegistrationType());

  // Stepper control
  // 1: Welcome, 2: Business, 3: Category, 4: Banking/Financial, 5: Pricing & Services, 6: Complete
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(false);

  // Google
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // OTP flow
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Form data
  const [selectedServiceType, setSelectedServiceType] = useState("Technical");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idType, setIdType] = useState("PAN");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]); // certificates / business images

  const [formData, setFormData] = useState({
    Business_Name: "",
    Owner_name: "",
    Email_address: "",
    Phone_number: "",
    Business_address: "",
    Category: registrationType === "Product" ? "" : "Technical",
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
    descripition: "",
  });

  // Sub-categories for Service type
  const subCategories = {
    Technical: [
      "Architects",
      "Civil Engineer",
      "Site Supervisor",
      "Survey Engineer",
      "MEP Consultant",
      "Structural Engineer",
      "Project Manager",
      "HVAC Engineer",
      "Safety Engineer",
      "Contractor",
      "Interior Designer",
      "WaterProofing Consultant",
      "Acoustic Consultants",
    ],
    "Non-Technical": [
      "EarthWork Labour",
      "Civil Mason",
      "Shuttering/Centring Labour",
      "Plumber",
      "Electrician",
      "Painter",
      "Carpenter",
      "Flooring Labour",
      "False Ceiling Worker",
      "Fabrication",
    ],
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // Toggle service type (for Service flow)
  const handleServiceTypeClick = (type) => {
    setSelectedServiceType(type);
    setFormData((p) => ({ ...p, Category: type, Sub_Category: [] }));
  };

  // Google Sign-in
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setIsGoogleUser(true);
      setFormData((prev) => ({
        ...prev,
        Owner_name: decoded.name || "",
        Email_address: decoded.email || "",
      }));
      toast.success("Google account linked!");
    } catch {
      toast.error("Google Login failed");
    }
  };

  // Locate user (reverse geocode)
  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const { latitude, longitude } = coords;
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.b6ebdeccc1f35c3e45b72aba8fec713c&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = (data.display_name || "")
            .split(",")
            .slice(0, 3)
            .join(", ");
          setFormData((p) => ({
            ...p,
            Business_address: address,
            Latitude: latitude.toString(),
            Longitude: longitude.toString(),
          }));
        } catch {
          toast.error("Location fetch failed");
        }
      },
      () => toast.error("Location access denied")
    );
  };

  // OTP
  const handleSendOtp = async () => {
    if (!formData.Email_address) return toast.warning("Enter your email");
    try {
      await axios.post("https://backend-d6mx.vercel.app/sendotp", {
        Email: formData.Email_address,
      });
      toast.success("OTP sent to your email!");
      setShowOtp(true);
      setOtpTimer(300);
    } catch {
      toast.error("Failed to send OTP");
    }
  };
  const verifyOtp = async () => {
    if (!otp) return toast.warning("Enter OTP");
    try {
      await axios.post("https://backend-d6mx.vercel.app/verifyotp", {
        Email: formData.Email_address,
        otp,
      });
      toast.success("OTP verified!");
      setOtpVerified(true);
    } catch {
      toast.error("Invalid OTP");
    }
  };
  useEffect(() => {
    let t;
    if (otpTimer > 0) t = setTimeout(() => setOtpTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpTimer]);

  // Files
  const handleCertificates = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
  };
  const handleProfile = (e) => {
    const file = e.target.files?.[0];
    setProfilePic(file || null);
    if (file) setProfilePreview(URL.createObjectURL(file));
    else setProfilePreview(null);
  };

  // Step navigation animations
  const nextStep = () => {
    setLoadingStep(true);
    setTimeout(() => {
      setStep((s) => Math.min(6, s + 1));
      setLoadingStep(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };
  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // Validate for email flow
    if (!isGoogleUser) {
      if (formData.Password !== confirmPassword)
        return toast.error("Passwords do not match");
      if (!otpVerified) return toast.error("Please verify OTP");
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      imageFiles.forEach((f) => data.append("productImages", f));
      if (profilePic) data.append("profileImage", profilePic);

      await axios.post("https://backend-d6mx.vercel.app/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful!");
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    }
  };

  // Stepper items
  const steps = [
    { title: "Welcome", icon: "bi-handshake-fill" },
    { title: "Business", icon: "bi-buildings-fill" },
    { title: "Category", icon: "bi-pin-map-fill" },
    { title: "Banking", icon: "bi-bank2" },
    { title: "Pricing", icon: "bi-cash-coin" },
    { title: "Complete", icon: "bi-check2-circle" },
  ];

  // Shared motion variants
  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="bg-soft py-4">
      <ToastContainer />
      {/* Top Stepper (yellow gradient, like screenshots) */}
      <div className="container">
        <div className="stepper-wrapper rounded-4 mb-4 p-4 shadow-sm">
          <h3 className="text-center fw-bold mb-1">Vendor Registration Process</h3>
          <p className="text-center text-muted mb-4">
            Complete all steps to join our marketplace
          </p>
          <div className="d-flex justify-content-between position-relative stepper-line">
            {steps.map((s, i) => {
              const num = i + 1;
              const status =
                num === step ? "active" : num < step ? "completed" : "pending";
              return (
                <div key={s.title} className="text-center flex-1 step-node">
                  <div className={`node-circle ${status}`}>
                    <Icon name={s.icon} className="m-0" />
                  </div>
                  <small className="d-block mt-2 text-secondary">{s.title}</small>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.form
        onSubmit={handleSubmit}
        {...fade}
        transition={{ duration: 0.35 }}
        className="container card border-0 shadow-lg rounded-4 p-4 p-md-5 mb-5"
        style={{ maxWidth: 980 }}
      >
        {/* STEP 1: Welcome */}
        {step === 1 && (
          <>
            <div className="text-center mb-4">
              <div className="welcome-icon bg-warning text-dark">
                <Icon name="bi-handshake" className="m-0 fs-3" />
              </div>
              <h2 className="fw-bold mt-3">Welcome to VendorHub</h2>
              <p className="text-muted">
                Join thousands of successful vendors. Start your journey to marketplace success.
              </p>
            </div>

            <div className="row g-3 mb-4 feature-strip">
              <div className="col-md-4">
                <div className="feature-card">
                  <span className="feature-icon bg-success-subtle text-success">
                    <Icon name="bi-graph-up-arrow" className="m-0" />
                  </span>
                  <div className="fw-semibold">Grow Sales</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card">
                  <span className="feature-icon bg-primary-subtle text-primary">
                    <Icon name="bi-people-fill" className="m-0" />
                  </span>
                  <div className="fw-semibold">Reach Customers</div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="feature-card">
                  <span className="feature-icon bg-purple-subtle text-purple">
                    <Icon name="bi-tools" className="m-0" />
                  </span>
                  <div className="fw-semibold">Manage Easy</div>
                </div>
              </div>
            </div>

            <div className="text-center mb-3">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => toast.error("Google Login Failed")}
              />
              <div className="text-muted small mt-2">or continue with email</div>
            </div>

            <div className="text-center">
              <button
                type="button"
                className="btn btn-warning text-dark px-5 py-2 rounded-pill"
                onClick={nextStep}
              >
                Get Started →
              </button>
            </div>
          </>
        )}

        {/* STEP 2: Business Information */}
        {step === 2 && (
          <>
            <h4 className="fw-bold mb-1 text-center">Business Information</h4>
            <p className="text-center text-muted mb-4">
              Tell us about your business
            </p>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Business Name *</label>
                <input
                  className="form-control"
                  name="Business_Name"
                  value={formData.Business_Name}
                  onChange={handleChange}
                  required
                />
                <small className="text-muted">This will be displayed to customers.</small>
              </div>
              <div className="col-md-6">
                <label className="form-label">Owner Name *</label>
                <input
                  className="form-control"
                  name="Owner_name"
                  value={formData.Owner_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-7">
                <label className="form-label">Email Address *</label>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    name="Email_address"
                    value={formData.Email_address}
                    onChange={handleChange}
                    required
                  />
                  <button
                    className="btn btn-outline-warning"
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                  >
                    {otpTimer > 0
                      ? `Resend in ${Math.floor(otpTimer / 60)}:${String(
                          otpTimer % 60
                        ).padStart(2, "0")}`
                      : "Send OTP"}
                  </button>
                </div>
                <small className="text-muted">We'll send important updates here.</small>
              </div>

              <div className="col-md-5">
                <label className="form-label">Phone Number *</label>
                <input
                  className="form-control"
                  name="Phone_number"
                  value={formData.Phone_number}
                  onChange={handleChange}
                  required
                />
              </div>

              {showOtp && (
                <div className="col-12">
                  <label className="form-label">Enter OTP</label>
                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      placeholder="6-digit code"
                    />
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={verifyOtp}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              <div className="col-12">
                <label className="form-label">Business Address *</label>
                <input
                  className="form-control"
                  name="Business_address"
                  value={formData.Business_address}
                  onChange={handleChange}
                  required
                />
                <div className="d-flex justify-content-end mt-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={handleLocateMe}
                  >
                    <Icon name="bi-geo-alt-fill" />
                    Locate Me
                  </button>
                </div>
              </div>

              {!isGoogleUser && (
                <>
                  <div className="col-md-6">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      name="Password"
                      value={formData.Password}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </>
              )}
            </div>

            <div className="info-note mt-3">
              <Icon name="bi-shield-lock-fill" />
              Verification Required — Your address may be verified for security and compliance.
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-5"
                onClick={nextStep}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Category */}
        {step === 3 && (
          <>
            <h4 className="fw-bold mb-1 text-center">Select Category</h4>
            <p className="text-center text-muted mb-4">
              Choose your service category and specializations
            </p>

            {registrationType === "Service" ? (
              <>
                <div className="text-center mb-3">
                  {["Technical", "Non-Technical"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`btn mx-1 ${
                        selectedServiceType === type
                          ? "btn-warning text-dark"
                          : "btn-outline-secondary"
                      }`}
                      onClick={() => handleServiceTypeClick(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <div className="row g-2">
                  {subCategories[selectedServiceType].map((sc) => (
                    <div key={sc} className="col-sm-6 col-lg-4">
                      <div className="form-check card-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={formData.Sub_Category.includes(sc)}
                          onChange={() => {
                            const updated = formData.Sub_Category.includes(sc)
                              ? formData.Sub_Category.filter((i) => i !== sc)
                              : [...formData.Sub_Category, sc];
                            setFormData((p) => ({ ...p, Sub_Category: updated }));
                          }}
                        />
                        <label className="form-check-label">{sc}</label>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="row g-3 mt-1">
                  <div className="col-md-6">
                    <label className="form-label">Charge</label>
                    <input
                      className="form-control"
                      name="Charge_Per_Hour_or_Day"
                      value={formData.Charge_Per_Hour_or_Day}
                      onChange={handleChange}
                      placeholder="e.g., 1200"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Charge Type</label>
                    <select
                      className="form-select"
                      name="Charge_Type"
                      value={formData.Charge_Type}
                      onChange={handleChange}
                    >
                      <option value="Day">Day</option>
                      <option value="Hour">Hour</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                {["CIVIL", "INTERIOR"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`btn mx-1 ${
                      formData.Category === type
                        ? "btn-warning text-dark"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, Category: type }))}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-5"
                onClick={nextStep}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* STEP 4: Financial Information (Banking & Tax) */}
        {step === 4 && (
          <>
            <h4 className="fw-bold mb-1 text-center">Financial Information</h4>
            <p className="text-center text-muted mb-4">
              Secure banking and tax details for payments
            </p>

            <div className="alert alert-warning-subtle border-warning-subtle text-dark d-flex align-items-center">
              <Icon name="bi-shield-lock-fill" />
              <span className="ms-2">
                All financial information is encrypted and stored securely. We never
                share your data with third parties.
              </span>
            </div>

            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">ID Type *</label>
                <select
                  className="form-select"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                >
                  <option value="PAN">PAN</option>
                  <option value="Aadhar">Aadhar</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">{idType} Number *</label>
                <input
                  className="form-control"
                  name="Tax_ID"
                  value={formData.Tax_ID}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Upload Tax/Business Document</label>
                <div className="drop-zone">
                  <input
                    type="file"
                    multiple
                    onChange={handleCertificates}
                    className="form-control"
                  />
                  <small className="text-muted">
                    Drag & drop or click to browse (PDF, JPG, PNG – Max 5MB each)
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Account Number</label>
                <input
                  className="form-control"
                  name="Account_Number"
                  value={formData.Account_Number}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">IFSC Code</label>
                <input
                  className="form-control"
                  name="IFSC_Code"
                  value={formData.IFSC_Code}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  className="form-control"
                  onChange={handleProfile}
                />
                {profilePreview && (
                  <img
                    src={profilePreview}
                    alt="profile preview"
                    className="rounded-circle mt-2"
                    style={{
                      width: 72,
                      height: 72,
                      objectFit: "cover",
                      border: "2px solid #f1f1f1",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="alert alert-success-subtle border-success-subtle mt-3">
              <strong>Payment Processing:</strong> Payments are processed within 2–3
              business days after service completion. A small processing fee may apply.
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-5"
                onClick={nextStep}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* STEP 5: Pricing & Services */}
        {step === 5 && (
          <>
            <h4 className="fw-bold mb-1 text-center">Pricing & Services</h4>
            <p className="text-center text-muted mb-4">
              Set your rates and describe your offerings
            </p>

            {/* Charge cards — visual only; actual values already captured */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <div
                  className={`pricing-card ${
                    formData.Charge_Type === "Hour" ? "selected" : ""
                  }`}
                  onClick={() =>
                    setFormData((p) => ({ ...p, Charge_Type: "Hour" }))
                  }
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="badge bg-warning text-dark rounded-circle p-3">
                      <Icon name="bi-clock-fill" className="m-0" />
                    </div>
                    <div>
                      <div className="fw-bold">Hourly Rate</div>
                      <small className="text-muted">
                        Charge per hour of service (best for consultations, repairs)
                      </small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div
                  className={`pricing-card ${
                    formData.Charge_Type === "Day" ? "selected" : ""
                  }`}
                  onClick={() => setFormData((p) => ({ ...p, Charge_Type: "Day" }))}
                >
                  <div className="d-flex align-items-center gap-2">
                    <div className="badge bg-warning text-dark rounded-circle p-3">
                      <Icon name="bi-calendar2-week" className="m-0" />
                    </div>
                    <div>
                      <div className="fw-bold">Daily Rate</div>
                      <small className="text-muted">
                        Charge per day of service (best for events, projects)
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Real inputs */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Base Rate *</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    className="form-control"
                    name="Charge_Per_Hour_or_Day"
                    value={formData.Charge_Per_Hour_or_Day}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>
                <small className="text-muted">
                  Your base rate per {formData.Charge_Type.toLowerCase()}.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label">Premium Rate (Optional)</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input className="form-control" placeholder="0.00" />
                </div>
                <small className="text-muted">
                  For premium/urgent services (not required).
                </small>
              </div>

              <div className="col-12">
                <label className="form-label">Business Description *</label>
                <textarea
                  className="form-control"
                  rows="4"
                  name="descripition"
                  value={formData.descripition}
                  onChange={handleChange}
                  placeholder="Describe your business, services, experience, and what makes you unique..."
                />
                <small className="text-muted">Minimum 50 characters recommended.</small>
              </div>

              <div className="col-12">
                <label className="form-label">Keywords & Tags</label>
                <input
                  className="form-control"
                  placeholder="e.g., quality, fast, reliable, experienced"
                />
                <small className="text-muted">
                  Separate keywords with commas to help customers find you (for UI only).
                </small>
              </div>
            </div>

            <div className="tips-card mt-3 p-3 rounded-3 bg-warning-subtle">
              <div className="fw-semibold mb-1">Pricing Tips</div>
              <ul className="mb-0 small">
                <li>Research competitor pricing in your area.</li>
                <li>Consider your experience level and certifications.</li>
              </ul>
            </div>

            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-warning text-dark px-5"
                onClick={nextStep}
              >
                Next →
              </button>
            </div>
          </>
        )}

        {/* STEP 6: Complete */}
        {step === 6 && (
          <div className="text-center py-5">
            <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 80, height: 80 }}>
              <Icon name="bi-check-lg" className="m-0 fs-2 text-white" />
            </div>
            <h4 className="fw-bold">All Set!</h4>
            <p className="text-muted">
              Review your details and complete registration.
            </p>
            <div className="d-flex justify-content-center gap-3">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button type="submit" className="btn btn-success px-5">
                Complete Registration
              </button>
            </div>
          </div>
        )}

        {loadingStep && (
          <div className="text-center my-3">
            <div className="spinner-border text-warning" role="status" />
            <div className="small text-muted mt-2">Loading next step…</div>
          </div>
        )}
      </motion.form>

      {/* Inline styles to match your screenshots (kept in-file for easy paste) */}
      <style>{`
        :root {
          --yellow: #FFD500;
          --yellow-600: #ffc107;
          --soft-bg: linear-gradient(180deg,#fff9e9, #fffef7);
          --purple: #6f42c1;
        }
        .bg-soft { background: var(--soft-bg); }

        .stepper-wrapper {
          background: linear-gradient(180deg,#fff6d6,#fffefb);
          border: 1px solid #f5e7b8;
        }
        .stepper-line::before {
          content: "";
          position: absolute;
          left: 6%;
          right: 6%;
          top: 28px;
          height: 4px;
          background: #e9ecef;
          border-radius: 8px;
        }
        .step-node { position: relative; z-index: 1; }
        .node-circle {
          width: 56px; height: 56px;
          border-radius: 999px;
          display:flex;align-items:center;justify-content:center;
          background:#e9ecef;color:#6c757d;border:2px solid #dee2e6;
          margin: 0 auto;
          transition: .25s;
        }
        .node-circle.active {
          background: var(--yellow);
          color:#111; border-color:#f3ca00; transform: scale(1.03);
        }
        .node-circle.completed {
          background: #28a745; color: #fff; border-color:#23913c;
        }
        .flex-1 { flex: 1 1 0; }

        .welcome-icon {
          width: 72px; height:72px;
          border-radius: 999px;
          display:flex;align-items:center;justify-content:center;
          box-shadow: 0 6px 20px rgba(0,0,0,.06);
          margin: 0 auto;
        }

        .feature-strip .feature-card {
          background: #fff;
          border: 1px solid #f1f1f1;
          border-radius: 18px;
          padding: 16px;
          display:flex; gap:12px; align-items:center; justify-content:center;
          height:100%;
          box-shadow: 0 8px 30px rgba(0,0,0,.04);
        }
        .feature-icon {
          display:inline-flex; align-items:center; justify-content:center;
          width:40px; height:40px; border-radius:12px;
        }

        .info-note {
          background: #fff9db;
          border: 1px solid #ffe9a8;
          color: #8a6d00;
          padding: 10px 12px;
          border-radius: 10px;
          font-size: .9rem;
        }

        .card-check {
          background: #fff;
          border: 1px solid #f0f0f0;
          padding: 10px 12px;
          border-radius: 12px;
        }

        .drop-zone {
          padding: 18px;
          border: 1px dashed #ced4da;
          border-radius: 12px;
          background: #fff;
        }

        .pricing-card {
          cursor: pointer;
          background: #fff;
          border: 2px solid #f2f2f2;
          border-radius: 16px;
          padding: 16px;
          transition: .2s;
          height: 100%;
        }
        .pricing-card:hover { border-color: #ffe082; background: #fffef5; }
        .pricing-card.selected { border-color: var(--yellow); background: #fffbe6; }

        .alert-warning-subtle {
          background: #fff6d6; border-radius: 12px;
        }
        .alert-success-subtle {
          background: #eafaf0; border-radius: 12px;
        }
        .border-warning-subtle { border: 1px solid #ffe7a8; }
        .border-success-subtle { border: 1px solid #b7e4c7; }

        .text-purple { color: var(--purple); }
        .bg-purple-subtle { background: rgba(111,66,193,.1); }

        @media (max-width: 768px) {
          .node-circle { width: 48px; height: 48px; }
          .stepper-line::before { left: 7%; right: 7%; top: 24px; }
        }
      `}</style>
    </div>
  );
}
