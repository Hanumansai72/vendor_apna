import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { api } from "../../../config";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { motion, AnimatePresence } from "framer-motion";
import "./Registration.css";

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const stepTimeoutRef = useRef(null);

  const getRegistrationType = () =>
    new URLSearchParams(location.search).get("tab") === "product" ? "Product" : "Service";

  const [registrationType] = useState(getRegistrationType());
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const otpInputRefs = useRef([]);

  const [selectedServiceType, setSelectedServiceType] = useState("Technical");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [idType, setIdType] = useState("PAN");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

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
    Account_Number: "",
    IFSC_Code: "",
    Charge_Type: "Day",
    Charge_Per_Hour_or_Day: "",
    descripition: "",
  });

  const subCategories = {
    Technical: [
      "Architects", "Civil Engineer", "Site Supervisor", "Survey Engineer",
      "MEP Consultant", "Structural Engineer", "Project Manager", "HVAC Engineer",
      "Safety Engineer", "Contractor", "Interior Designer", "WaterProofing Consultant",
      "Acoustic Consultants",
    ],
    "Non-Technical": [
      "EarthWork Labour", "Civil Mason", "Plumber", "Electrician", "Painter",
      "Carpenter", "False Ceiling Worker", "Fabrication", "Lift Technician", "Dismantaling Expert"
    ],
  };

  const steps = [
    { title: "Welcome", icon: "bi-rocket-takeoff-fill", description: "Get Started" },
    { title: "Business", icon: "bi-building", description: "Basic Info" },
    { title: "Category", icon: "bi-grid-fill", description: "Services" },
    { title: "Banking", icon: "bi-bank2", description: "Financial" },
    { title: "Pricing", icon: "bi-currency-rupee", description: "Rates" },
    { title: "Complete", icon: "bi-check-circle-fill", description: "Finish" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleServiceTypeClick = (type) => {
    setSelectedServiceType(type);
    setFormData((p) => ({ ...p, Category: type, Sub_Category: [] }));
  };

  const handleSubCategoryToggle = (sc) => {
    const updated = formData.Sub_Category.includes(sc)
      ? formData.Sub_Category.filter((i) => i !== sc)
      : [...formData.Sub_Category, sc];
    setFormData((p) => ({ ...p, Sub_Category: updated }));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    toast.info("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude } = coords;
        try {
          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.b6ebdeccc1f35c3e45b72aba8fec713c&lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const address = (data.display_name || "").split(",").slice(0, 3).join(", ");
          setFormData((p) => ({
            ...p,
            Business_address: address,
            Latitude: latitude.toString(),
            Longitude: longitude.toString(),
          }));
          toast.success("Location fetched successfully!");
        } catch {
          toast.error("Location fetch failed");
        }
      },
      () => toast.error("Location access denied")
    );
  };

  const handleSendOtp = async () => {
    if (!formData.Email_address) return toast.warning("Enter your email first");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email_address)) {
      return toast.warning("Please enter a valid email address");
    }
    try {
      await api.post(`/sendotp`, {
        Email: formData.Email_address,
      });
      toast.success("OTP sent to your email!");
      setShowOtp(true);
      setOtpTimer(300);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) return toast.warning("Enter complete OTP");
    try {
      await api.post(`/verifyotp`, {
        Email: formData.Email_address,
        otp: otpString,
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

  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setIsGoogleUser(true);
      setFormData((prev) => ({
        ...prev,
        Owner_name: decoded.name || "",
        Email_address: decoded.email || "",
      }));

      if (registrationType === "Product") {
        const data = new FormData();
        Object.keys(formData).forEach((k) => data.append(k, formData[k]));
        await api.post(`/register`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Registered successfully with Google!");
        navigate("/");
      } else {
        toast.info("Google linked! Continue setup.");
        setStep(2);
      }
    } catch {
      toast.error("Google signup failed");
    }
  };

  const handleCertificates = (e) => setImageFiles(Array.from(e.target.files || []));

  const handleProfile = (e) => {
    const f = e.target.files?.[0];
    setProfilePic(f || null);
    setProfilePreview(f ? URL.createObjectURL(f) : null);
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 2:
        if (!formData.Business_Name.trim()) {
          toast.warning("Please enter your business name");
          return false;
        }
        if (!formData.Owner_name.trim()) {
          toast.warning("Please enter owner name");
          return false;
        }
        if (!formData.Email_address.trim()) {
          toast.warning("Please enter email address");
          return false;
        }
        if (!isGoogleUser && !otpVerified) {
          toast.warning("Please verify your email with OTP");
          return false;
        }
        if (!formData.Phone_number.trim()) {
          toast.warning("Please enter phone number");
          return false;
        }
        if (!isGoogleUser) {
          if (!formData.Password) {
            toast.warning("Please enter password");
            return false;
          }
          if (formData.Password !== confirmPassword) {
            toast.warning("Passwords do not match");
            return false;
          }
          if (formData.Password.length < 6) {
            toast.warning("Password must be at least 6 characters");
            return false;
          }
        }
        return true;
      case 3:
        if (registrationType === "Service" && formData.Sub_Category.length === 0) {
          toast.warning("Please select at least one sub-category");
          return false;
        }
        if (registrationType === "Product" && !formData.Category) {
          toast.warning("Please select a category");
          return false;
        }
        return true;
      case 5:
        if (!formData.Charge_Per_Hour_or_Day) {
          toast.warning("Please enter your base rate");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (stepTimeoutRef.current) {
        clearTimeout(stepTimeoutRef.current);
      }
    };
  }, []);

  // Safety: ensure loadingStep never stays true for more than 2 seconds
  useEffect(() => {
    if (loadingStep) {
      const safetyTimeout = setTimeout(() => {
        setLoadingStep(false);
      }, 2000);
      return () => clearTimeout(safetyTimeout);
    }
  }, [loadingStep]);

  const nextStep = useCallback(() => {
    if (!validateStep(step)) return;

    // Clear any existing timeout
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }

    setLoadingStep(true);
    stepTimeoutRef.current = setTimeout(() => {
      setStep((s) => Math.min(6, s + 1));
      setLoadingStep(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  }, [step]);

  const prevStep = useCallback(() => {
    // Clear any existing timeout
    if (stepTimeoutRef.current) {
      clearTimeout(stepTimeoutRef.current);
    }
    setLoadingStep(false);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGoogleUser) {
      if (formData.Password !== confirmPassword)
        return toast.error("Passwords do not match");
      if (!otpVerified) return toast.error("Please verify OTP");
    }
    if (isGoogleUser && registrationType === "Service") {
      if (!formData.Charge_Per_Hour_or_Day) return toast.warning("Enter base rate");
      if (!formData.Category) return toast.warning("Choose Technical / Non-Technical");
    }

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      imageFiles.forEach((f) => data.append("productImages", f));
      if (profilePic) data.append("profileImage", profilePic);

      await api.post(`/register`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      toast.error("Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepperProgress = () => {
    if (step <= 1) return 0;
    const progressPerStep = 100 / (steps.length - 1);
    return Math.min((step - 1) * progressPerStep, 100);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <div className="registration-page">
      <ToastContainer theme="light" position="top-right" />

      {/* Header */}
      <header className="registration-header">
        <div className="brand-logo">
          <div className="logo-icon">
            <img src="/comapny_logo.ico" alt="Apna Mestri" />
          </div>
          <span className="brand-name">Apna Mestri</span>
        </div>
        <h1>Vendor Registration</h1>
        <p>Join our marketplace and grow your business</p>
      </header>

      {/* Stepper */}
      <div className="stepper-container">
        <div className="stepper-track">
          <div
            className="stepper-progress"
            style={{ width: `calc(${getStepperProgress()}% - 40px)` }}
          />
          {steps.map((s, i) => {
            const num = i + 1;
            const status =
              num === step ? "active" : num < step ? "completed" : "";
            return (
              <div key={s.title} className={`step-item ${status}`}>
                <div className="step-icon-wrapper">
                  {status === "completed" ? (
                    <i className="bi bi-check-lg"></i>
                  ) : (
                    <i className={`bi ${s.icon}`}></i>
                  )}
                </div>
                <span className="step-label">{s.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form */}
      <motion.form
        ref={formRef}
        onSubmit={handleSubmit}
        className="registration-form-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AnimatePresence mode="wait">
          {loadingStep ? (
            <motion.div
              key="loading"
              className="loading-overlay"
              {...fadeVariants}
            >
              <div className="spinner"></div>
              <p className="loading-text">Loading next step...</p>
            </motion.div>
          ) : (
            <>
              {/* STEP 1: Welcome */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  className="welcome-section"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="welcome-icon">
                    <i className="bi bi-rocket-takeoff-fill"></i>
                  </div>
                  <h2 className="welcome-title">Welcome to Apna Mestri</h2>
                  <p className="welcome-subtitle">
                    Start your journey as a vendor and connect with thousands of customers looking for your services.
                  </p>

                  <div className="google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={() => toast.error("Google Login Failed")}
                      theme="filled_black"
                      shape="pill"
                      size="large"
                    />
                  </div>

                  <div className="social-login-divider">
                    <span>or continue with email</span>
                  </div>

                  <button
                    type="button"
                    className="btn-primary-custom"
                    onClick={nextStep}
                  >
                    Get Started
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Business Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="section-title">
                    <h2>Business Information</h2>
                    <p>Tell us about your business and yourself</p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Business Name <span className="required">*</span>
                      </label>
                      <div className="input-icon-wrapper">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your business name"
                          name="Business_Name"
                          value={formData.Business_Name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        Owner Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter owner's full name"
                        name="Owner_name"
                        value={formData.Owner_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <div className="input-group-custom">
                      <input
                        type="email"
                        className="form-input"
                        placeholder="you@example.com"
                        name="Email_address"
                        value={formData.Email_address}
                        onChange={handleChange}
                        disabled={isGoogleUser}
                      />
                      {!isGoogleUser && !otpVerified && (
                        <button
                          type="button"
                          className="btn-outline-custom"
                          onClick={handleSendOtp}
                          disabled={otpTimer > 0}
                        >
                          {otpTimer > 0 ? `Resend in ${formatTime(otpTimer)}` : "Send OTP"}
                        </button>
                      )}
                      {otpVerified && (
                        <div className="verified-badge">
                          <i className="bi bi-check-circle-fill"></i>
                          Verified
                        </div>
                      )}
                    </div>
                  </div>

                  {showOtp && !otpVerified && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="form-group"
                    >
                      <label className="form-label">Enter OTP</label>
                      <div className="otp-container">
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => (otpInputRefs.current[idx] = el)}
                            type="text"
                            maxLength="1"
                            className="otp-input"
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          />
                        ))}
                      </div>
                      <div className="otp-timer">
                        {otpTimer > 0 && (
                          <span>OTP expires in <span>{formatTime(otpTimer)}</span></span>
                        )}
                      </div>
                      <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button
                          type="button"
                          className="btn-success-custom"
                          onClick={verifyOtp}
                        >
                          <i className="bi bi-shield-check"></i>
                          Verify OTP
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        Phone Number <span className="required">*</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+91 9876543210"
                        name="Phone_number"
                        value={formData.Phone_number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Business Address</label>
                      <div className="input-group-custom">
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Enter your business address"
                          name="Business_address"
                          value={formData.Business_address}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className="btn-outline-custom"
                          onClick={handleLocateMe}
                        >
                          <i className="bi bi-geo-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>

                  {!isGoogleUser && (
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">
                          Password <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Create a strong password"
                          name="Password"
                          value={formData.Password}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Confirm Password <span className="required">*</span>
                        </label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-navigation">
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={prevStep}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary-custom"
                      onClick={nextStep}
                    >
                      Continue
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Category */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="section-title">
                    <h2>Select Your Category</h2>
                    <p>Choose the services you provide</p>
                  </div>

                  {registrationType === "Service" ? (
                    <>
                      <div className="category-toggle">
                        {["Technical", "Non-Technical"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`category-btn ${selectedServiceType === type ? "active" : ""
                              }`}
                            onClick={() => handleServiceTypeClick(type)}
                          >
                            <i className={`bi ${type === "Technical" ? "bi-gear-fill" : "bi-tools"} me-2`}></i>
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="subcategory-grid">
                        {subCategories[selectedServiceType].map((sc) => (
                          <div
                            key={sc}
                            className={`subcategory-item ${formData.Sub_Category.includes(sc) ? "selected" : ""
                              }`}
                            onClick={() => handleSubCategoryToggle(sc)}
                          >
                            <div className="subcategory-checkbox">
                              <i className="bi bi-check"></i>
                            </div>
                            <span className="subcategory-label">{sc}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="category-toggle">
                      {["CIVIL", "INTERIOR"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          className={`category-btn ${formData.Category === type ? "active" : ""
                            }`}
                          onClick={() =>
                            setFormData((p) => ({ ...p, Category: type }))
                          }
                        >
                          <i className={`bi ${type === "CIVIL" ? "bi-bricks" : "bi-house-heart-fill"} me-2`}></i>
                          {type}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="form-navigation">
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={prevStep}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary-custom"
                      onClick={nextStep}
                    >
                      Continue
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Banking */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="section-title">
                    <h2>Financial Information</h2>
                    <p>Add your banking and identity details</p>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">ID Type</label>
                      <select
                        className="form-select form-input"
                        value={idType}
                        onChange={(e) => setIdType(e.target.value)}
                      >
                        <option value="PAN">PAN Card</option>
                        <option value="Aadhar">Aadhar Card</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{idType} Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Enter your ${idType} number`}
                        name="Tax_ID"
                        value={formData.Tax_ID}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Account Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter bank account number"
                        name="Account_Number"
                        value={formData.Account_Number}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">IFSC Code</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter IFSC code"
                        name="IFSC_Code"
                        value={formData.IFSC_Code}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Certificates</label>
                    <label className="file-upload-zone">
                      <input
                        type="file"
                        multiple
                        className="file-upload-input"
                        onChange={handleCertificates}
                        accept=".pdf,.jpg,.jpeg,.png"
                      />
                      <div className="file-upload-icon">
                        <i className="bi bi-cloud-arrow-up"></i>
                      </div>
                      <p className="file-upload-text">
                        {imageFiles.length > 0
                          ? `${imageFiles.length} file(s) selected`
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="file-upload-hint">PDF, JPG, PNG up to 10MB</p>
                    </label>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <label className={`file-upload-zone ${profilePreview ? "has-file" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="file-upload-input"
                        onChange={handleProfile}
                      />
                      {profilePreview ? (
                        <div className="profile-preview-container">
                          <img
                            src={profilePreview}
                            alt="Profile Preview"
                            className="profile-preview"
                          />
                          <div>
                            <p className="file-upload-text">Profile photo selected</p>
                            <p className="file-upload-hint">Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="file-upload-icon">
                            <i className="bi bi-person-circle"></i>
                          </div>
                          <p className="file-upload-text">Upload your profile photo</p>
                          <p className="file-upload-hint">JPG, PNG up to 5MB</p>
                        </>
                      )}
                    </label>
                  </div>

                  <div className="form-navigation">
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={prevStep}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary-custom"
                      onClick={nextStep}
                    >
                      Continue
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: Pricing */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="section-title">
                    <h2>Pricing & Services</h2>
                    <p>Set your rates and describe your offerings</p>
                  </div>

                  {isGoogleUser && registrationType === "Service" && (
                    <>
                      <div className="category-toggle" style={{ marginBottom: "1.5rem" }}>
                        {["Technical", "Non-Technical"].map((type) => (
                          <button
                            key={type}
                            type="button"
                            className={`category-btn ${selectedServiceType === type ? "active" : ""
                              }`}
                            onClick={() => handleServiceTypeClick(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>

                      <div className="subcategory-grid" style={{ marginBottom: "2rem" }}>
                        {subCategories[selectedServiceType].map((sc) => (
                          <div
                            key={sc}
                            className={`subcategory-item ${formData.Sub_Category.includes(sc) ? "selected" : ""
                              }`}
                            onClick={() => handleSubCategoryToggle(sc)}
                          >
                            <div className="subcategory-checkbox">
                              <i className="bi bi-check"></i>
                            </div>
                            <span className="subcategory-label">{sc}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="pricing-card">
                    <div className="pricing-header">
                      <div className="pricing-icon">
                        <i className="bi bi-cash-stack"></i>
                      </div>
                      <h3 className="pricing-title">Your Base Rate</h3>
                    </div>
                    <div className="price-input-group">
                      <span className="currency-symbol">₹</span>
                      <input
                        type="number"
                        className="price-input"
                        placeholder="0"
                        name="Charge_Per_Hour_or_Day"
                        value={formData.Charge_Per_Hour_or_Day}
                        onChange={handleChange}
                      />
                      <div className="rate-type-toggle">
                        <button
                          type="button"
                          className={`rate-btn ${formData.Charge_Type === "Hour" ? "active" : ""}`}
                          onClick={() => setFormData((p) => ({ ...p, Charge_Type: "Hour" }))}
                        >
                          / Hour
                        </button>
                        <button
                          type="button"
                          className={`rate-btn ${formData.Charge_Type === "Day" ? "active" : ""}`}
                          onClick={() => setFormData((p) => ({ ...p, Charge_Type: "Day" }))}
                        >
                          / Day
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Describe Your Business</label>
                    <textarea
                      rows="4"
                      className="form-input"
                      placeholder="Tell customers about your services, experience, and what makes you unique..."
                      name="descripition"
                      value={formData.descripition}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="form-navigation">
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={prevStep}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back
                    </button>
                    <button
                      type="button"
                      className="btn-primary-custom"
                      onClick={nextStep}
                    >
                      Continue
                      <i className="bi bi-arrow-right"></i>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: Complete */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  className="completion-section"
                  {...fadeVariants}
                  transition={{ duration: 0.4 }}
                >
                  <div className="completion-icon">
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <h2 className="completion-title">You're All Set!</h2>
                  <p className="completion-subtitle">
                    Review your information and complete your registration to start receiving jobs.
                  </p>

                  <div className="summary-card">
                    <div className="summary-item">
                      <span className="summary-label">Business Name</span>
                      <span className="summary-value">{formData.Business_Name || "—"}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Owner</span>
                      <span className="summary-value">{formData.Owner_name || "—"}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Email</span>
                      <span className="summary-value">{formData.Email_address || "—"}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Category</span>
                      <span className="summary-value">{formData.Category || "—"}</span>
                    </div>
                    <div className="summary-item">
                      <span className="summary-label">Base Rate</span>
                      <span className="summary-value">
                        {formData.Charge_Per_Hour_or_Day
                          ? `₹${formData.Charge_Per_Hour_or_Day} / ${formData.Charge_Type}`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="form-navigation" style={{ justifyContent: "center", borderTop: "none" }}>
                    <button
                      type="button"
                      className="btn-secondary-custom"
                      onClick={prevStep}
                      disabled={isSubmitting}
                    >
                      <i className="bi bi-arrow-left"></i>
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-success-custom"
                      disabled={isSubmitting}
                      style={{ padding: "1rem 2.5rem", fontSize: "1.1rem" }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle-fill"></i>
                          Complete Registration
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
