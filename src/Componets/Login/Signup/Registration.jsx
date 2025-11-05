import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

// Reusable icon helper
const Icon = ({ name, className = "me-2" }) => <i className={`bi ${name} ${className}`} />;

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine registration type
  const getRegistrationType = () =>
    new URLSearchParams(location.search).get("tab") === "product"
      ? "Product"
      : "Service";

  const [registrationType] = useState(getRegistrationType());
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // OTP
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
      "Plumber",
      "Electrician",
      "Painter",
      "Carpenter",
      "False Ceiling Worker",
      "Fabrication",
    ],
  };

  // handle change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // service type
  const handleServiceTypeClick = (type) => {
    setSelectedServiceType(type);
    setFormData((p) => ({ ...p, Category: type, Sub_Category: [] }));
  };

  // geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
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
        } catch {
          toast.error("Location fetch failed");
        }
      },
      () => toast.error("Location access denied")
    );
  };

  // OTP logic
  const handleSendOtp = async () => {
    if (!formData.Email_address) return toast.warning("Enter your email first");
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
    if (!otp) return toast.warning("Please enter the OTP");
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

  // Google signup logic (with your conditions)
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
        // Direct signup for non-professional (product vendors)
        const data = new FormData();
        Object.keys(formData).forEach((key) => data.append(key, formData[key]));
        await axios.post("https://backend-d6mx.vercel.app/register", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Registered successfully with Google!");
        navigate("/");
      } else {
        // For professionals → go directly to pricing step (Step 5)
        toast.info("Google connected! Please complete your base rate info.");
        setStep(5);
      }
    } catch {
      toast.error("Google signup failed");
    }
  };

  // file uploads
  const handleCertificates = (e) => {
    setImageFiles(Array.from(e.target.files || []));
  };
  const handleProfile = (e) => {
    const file = e.target.files?.[0];
    setProfilePic(file);
    if (file) setProfilePreview(URL.createObjectURL(file));
  };

  // next/prev
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

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGoogleUser) {
      if (formData.Password !== confirmPassword)
        return toast.error("Passwords do not match");
      if (!otpVerified) return toast.error("Please verify OTP first");
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
    } catch {
      toast.error("Registration failed");
    }
  };

  // Steps
  const steps = [
    { title: "Welcome", icon: "bi-handshake-fill" },
    { title: "Business", icon: "bi-buildings-fill" },
    { title: "Category", icon: "bi-pin-map-fill" },
    { title: "Banking", icon: "bi-bank2" },
    { title: "Pricing", icon: "bi-cash-coin" },
    { title: "Complete", icon: "bi-check2-circle" },
  ];

  const fade = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="bg-soft py-4">
      <ToastContainer />
      {/* Stepper Header */}
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

      {/* Main Form */}
      <motion.form
        onSubmit={handleSubmit}
        {...fade}
        transition={{ duration: 0.35 }}
        className="container card border-0 shadow-lg rounded-4 p-4 p-md-5 mb-5"
        style={{ maxWidth: 980 }}
      >
        {/* STEP 1 - Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="mb-4">
              <GoogleLogin
                onSuccess={handleGoogleSignup}
                onError={() => toast.error("Google Login Failed")}
              />
              <div className="text-muted small mt-2">or continue with email</div>
            </div>
            <button
              type="button"
              className="btn btn-warning text-dark px-5 py-2 rounded-pill"
              onClick={nextStep}
            >
              Get Started →
            </button>
          </div>
        )}

        {/* STEP 2–4 same as before (Business, Category, Banking)... */}

        {/* STEP 5 - Pricing & Google-specific minimal registration */}
        {step === 5 && (
          <>
            <h4 className="fw-bold text-center mb-4">Pricing & Services</h4>
            <p className="text-center text-muted mb-4">
              Set your base rate to continue registration
            </p>
            {isGoogleUser && registrationType === "Service" && (
              <div className="text-center mb-3">
                <h6>Select your service type:</h6>
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
            )}
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    className="form-control"
                    name="Charge_Per_Hour_or_Day"
                    value={formData.Charge_Per_Hour_or_Day}
                    onChange={handleChange}
                    placeholder="Base rate"
                  />
                </div>
              </div>
              <div className="col-md-6">
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
            <div className="text-center mt-4">
              <button type="submit" className="btn btn-success px-5">
                Complete Registration
              </button>
            </div>
          </>
        )}

        {/* STEP 6 */}
        {step === 6 && (
          <div className="text-center py-4">
            <h4>All Set!</h4>
            <p className="text-muted">Click below to complete registration</p>
            <button type="submit" className="btn btn-success px-5">
              Complete Registration
            </button>
          </div>
        )}
      </motion.form>
    </div>
  );
}
