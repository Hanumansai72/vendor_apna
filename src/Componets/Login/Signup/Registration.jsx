import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";

const Icon = ({ name, className = "me-2" }) => <i className={`bi ${name} ${className}`} />;

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();

  // detect product/service from URL param
  const getRegistrationType = () =>
    new URLSearchParams(location.search).get("tab") === "product"
      ? "Product"
      : "Service";
  const [registrationType, setRegistrationType] = useState(getRegistrationType());

  // core state
  const [step, setStep] = useState(1);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loadingStep, setLoadingStep] = useState(false);

  // otp flow
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // files
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  // form
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    Owner_name: "",
    Full_Name: "",
    Email_address: "",
    Password: "",
    Phone_number: "",
    Business_Name: "",
    Business_address: "",
  });

  // handle changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  // OTP
  const handleSendOtp = async () => {
    if (!formData.Email_address) return toast.warning("Enter your email");
    try {
      await axios.post("https://backend-d6mx.vercel.app/send-otp", {
        Email_address: formData.Email_address,
      });
      toast.success("OTP sent to your email!");
      setOtpTimer(300);
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.warning("Enter OTP");
    try {
      await axios.post("https://backend-d6mx.vercel.app/verify-otp", {
        Email_address: formData.Email_address,
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

  // google signup logic
  const handleGoogleSignup = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      setIsGoogleUser(true);
      setFormData((prev) => ({
        ...prev,
        Owner_name: decoded.name || "",
        Full_Name: decoded.name || "",
        Email_address: decoded.email || "",
      }));

      toast.success("Google account linked!");

      if (registrationType === "Product") {
        // directly register
        const data = new FormData();
        Object.keys(formData).forEach((k) =>
          data.append(k, formData[k] || "")
        );
        data.append("Owner_name", decoded.name);
        data.append("Email_address", decoded.email);

        await axios.post("https://backend-d6mx.vercel.app/register", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Registered successfully with Google!");
        navigate("/");
      } else {
        setStep(2);
      }
    } catch {
      toast.error("Google login failed");
    }
  };

  // file handlers
  const handleProfile = (e) => {
    const file = e.target.files?.[0];
    setProfilePic(file);
    if (file) setProfilePreview(URL.createObjectURL(file));
  };
  const handleImages = (e) => {
    setImageFiles(Array.from(e.target.files || []));
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isGoogleUser && formData.Password !== confirmPassword)
      return toast.error("Passwords do not match");
    if (!isGoogleUser && !otpVerified)
      return toast.error("Please verify your OTP");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((k) => data.append(k, formData[k]));
      imageFiles.forEach((f) => data.append("productImages", f));
      if (profilePic) data.append("profileImage", profilePic);

      await axios.post("https://backend-d6mx.vercel.app/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Registration successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      toast.error("Registration failed");
    }
  };

  // navigation
  const nextStep = () => {
    setLoadingStep(true);
    setTimeout(() => {
      setStep((s) => Math.min(s + 1, 6));
      setLoadingStep(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 400);
  };
  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const fade = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="bg-soft py-4">
      <ToastContainer />
      {/* Stepper */}
      <div className="container">
        <div className="stepper-wrapper rounded-4 mb-4 p-4 shadow-sm">
          <h3 className="text-center fw-bold mb-1">Vendor Registration</h3>
          <p className="text-center text-muted mb-4">
            Complete all steps to join our marketplace
          </p>
        </div>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        {...fade}
        transition={{ duration: 0.35 }}
        className="container card border-0 shadow-lg rounded-4 p-4 p-md-5 mb-5"
        style={{ maxWidth: 980 }}
      >
        {/* STEP 1 — Google / Basic */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="fw-bold mb-3">Welcome!</h2>
            <GoogleLogin
              onSuccess={handleGoogleSignup}
              onError={() => toast.error("Google login failed")}
            />
            <p className="text-muted mt-2">or continue with Email</p>
            <button
              type="button"
              className="btn btn-warning mt-3"
              onClick={nextStep}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Account Info */}
        {step === 2 && (
          <>
            <h4 className="fw-bold mb-3 text-center">Account Information</h4>
            <div className="row g-3">
              {registrationType === "Service" ? (
                <input
                  className="form-control"
                  placeholder="Owner Name"
                  name="Owner_name"
                  value={formData.Owner_name}
                  onChange={handleChange}
                  disabled={isGoogleUser}
                />
              ) : (
                <input
                  className="form-control"
                  placeholder="Full Name"
                  name="Full_Name"
                  value={formData.Full_Name}
                  onChange={handleChange}
                  disabled={isGoogleUser}
                />
              )}

              <input
                className="form-control"
                type="email"
                placeholder="Email Address"
                name="Email_address"
                value={formData.Email_address}
                onChange={handleChange}
                disabled={isGoogleUser}
              />

              {!isGoogleUser && (
                <>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <div className="d-flex gap-2">
                    <input
                      className="form-control"
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-outline-warning"
                      onClick={handleSendOtp}
                      disabled={otpTimer > 0}
                    >
                      {otpTimer > 0
                        ? `Resend in ${Math.floor(otpTimer / 60)}:${String(
                            otpTimer % 60
                          ).padStart(2, "0")}`
                        : "Send OTP"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleVerifyOtp}
                    >
                      Verify
                    </button>
                  </div>
                </>
              )}
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

        {/* STEP 3 — Uploads */}
        {step === 3 && (
          <>
            <h4 className="fw-bold mb-3 text-center">Upload Images</h4>
            <input
              type="file"
              className="form-control mb-3"
              onChange={handleProfile}
            />
            {profilePreview && (
              <img
                src={profilePreview}
                alt="profile"
                style={{ width: 80, height: 80, borderRadius: "50%" }}
              />
            )}
            <input
              type="file"
              className="form-control"
              multiple
              onChange={handleImages}
            />
            <div className="d-flex justify-content-between mt-4">
              <button type="button" className="btn btn-light" onClick={prevStep}>
                ← Back
              </button>
              <button type="submit" className="btn btn-success px-5">
                Register
              </button>
            </div>
          </>
        )}

        {loadingStep && (
          <div className="text-center mt-3">
            <div className="spinner-border text-warning" />
            <div className="small text-muted mt-2">Loading…</div>
          </div>
        )}
      </motion.form>
    </div>
  );
}
