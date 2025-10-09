import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";

export default function Registration() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [registrationType, setRegistrationType] = useState("Service");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const [formData, setFormData] = useState({
    Owner_name: "",
    Email_address: "",
    Password: "",
    Full_Name: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  const [imageFiles, setImageFiles] = useState([]);
  const [profilePic, setProfilePic] = useState(null);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // OTP Verification
  const handleSendOtp = async () => {
    try {
      await axios.post("https://backend-d6mx.vercel.app/send-otp", {
        Email_address: formData.Email_address,
      });
      toast.success("OTP sent to your email!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await axios.post("https://backend-d6mx.vercel.app/verify-otp", {
        Email_address: formData.Email_address,
        otp,
      });
      setOtpVerified(true);
      toast.success("OTP Verified!");
    } catch (err) {
      console.error(err);
      toast.error("OTP Verification Failed");
    }
  };

  // Google Signup
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
        // Build formData manually with Google values
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
          if (key === "Email_address") data.append("Email_address", decoded.email);
          else if (key === "Owner_name") data.append("Owner_name", decoded.name || "");
          else data.append(key, formData[key]);
        });

        await axios.post("https://backend-d6mx.vercel.app/register", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("Registered with Google!");
        navigate("/");
      } else {
        // Service + Google → skip Step 1, go to Step 2
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      toast.error("Google Signup failed");
    }
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate Product Google submit
    if (isGoogleUser && registrationType === "Product") return;

    // Service with Google → wait until Step 2
    if (isGoogleUser && registrationType === "Service" && step < 2) return;

    if (!isGoogleUser && formData.Password && formData.Password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (!isGoogleUser && !otpVerified) return toast.error("Please verify your OTP");

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      imageFiles.forEach((file) => data.append("productImages", file));
      if (profilePic) data.append("profileImage", profilePic);

      await axios.post("https://backend-d6mx.vercel.app/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Registration successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Registration failed");
    }
  };

  return (
    <div className="container my-5">
      <ToastContainer />

      {/* Google Login Button OUTSIDE form */}
      <div className="text-center mb-3">
        <GoogleLogin
          onSuccess={handleGoogleSignup}
          onError={() => toast.error("Google Login Failed")}
          ux_mode="popup"
          redirectUri={window.location.origin}
        />
      </div>

      <form className="card p-4 shadow" onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="d-flex mb-3">
          <button
            type="button"
            className={`btn me-2 ${
              registrationType === "Service" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setRegistrationType("Service");
              setStep(1);
            }}
          >
            Service
          </button>
          <button
            type="button"
            className={`btn ${
              registrationType === "Product" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => {
              setRegistrationType("Product");
              setStep(1);
            }}
          >
            Product
          </button>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <>
            {registrationType === "Product" && (
              <>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Full Name"
                  name="Full_Name"
                  value={formData.Full_Name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  name="Email_address"
                  value={formData.Email_address}
                  onChange={handleChange}
                  required
                  disabled={isGoogleUser}
                />
              </>
            )}
            {registrationType === "Service" && (
              <>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder="Owner Name"
                  name="Owner_name"
                  value={formData.Owner_name}
                  onChange={handleChange}
                  required
                  disabled={isGoogleUser}
                />
                <input
                  type="email"
                  className="form-control mb-3"
                  placeholder="Email"
                  name="Email_address"
                  value={formData.Email_address}
                  onChange={handleChange}
                  required
                  disabled={isGoogleUser}
                />
                {!isGoogleUser && (
                  <>
                    <input
                      type="password"
                      className="form-control mb-3"
                      placeholder="Password"
                      name="Password"
                      value={formData.Password}
                      onChange={handleChange}
                      required
                    />
                    <input
                      type="password"
                      className="form-control mb-3"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <div className="d-flex mb-3">
                      <input
                        type="text"
                        className="form-control me-2"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button type="button" className="btn btn-secondary me-2" onClick={handleSendOtp}>
                        Send OTP
                      </button>
                      <button type="button" className="btn btn-success" onClick={handleVerifyOtp}>
                        Verify
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
            {registrationType === "Service" && (
              <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                Next
              </button>
            )}
            {registrationType === "Product" && (
              <button type="submit" className="btn btn-primary">
                Register
              </button>
            )}
          </>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <>
            <input
              type="file"
              className="form-control mb-3"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
            <input
              type="file"
              className="form-control mb-3"
              multiple
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
            />
            <button type="submit" className="btn btn-success">
              Register
            </button>
          </>
        )}
      </form>
    </div>
  );
}
