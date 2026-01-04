import { api } from "../../../config";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import AdminApprovalPending from "../../Vendor/Adminapprovalpage";
import { useAuth } from "../../Auth/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import "./Login.css";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("vendor");
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [tech, setTech] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [loginMethod, setLoginMethod] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  const otpInputRefs = useRef([]);

  // OTP Timer Effect
  useEffect(() => {
    let timer;
    if (otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer((s) => s - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  // OTP Input Handlers
  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Send OTP for email login
  const sendOtp = async () => {
    if (!username) {
      return toast.warning("Please enter your email first");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
      return toast.warning("Please enter a valid email address");
    }

    setIsLoading(true);
    try {
      await api.post('/sendotp', { Email: username });
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setLoginMethod("otp");
      setOtpTimer(300);
      setOtp(["", "", "", "", "", ""]);
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and login
  const verifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      return toast.warning("Please enter complete OTP");
    }

    setIsLoading(true);
    try {
      const res = await api.post('/verifyotp', {
        Email: username,
        otp: otpString,
      });

      if (res.data.message === "OTP verified") {
        toast.success("OTP verified successfully");
        setOtpVerified(true);

        // After OTP verified, login via OTP
        const loginRes = await api.post('/loginwith-otp', {
          email: username,
        });

        if (loginRes.data.message === "Success" && loginRes.data.vendorId) {
          // Token is handled by cookies now
          login(loginRes.data.vendor || { id: loginRes.data.vendorId });
          setVendorId(loginRes.data.vendorId);
        } else if (loginRes.data.message === "User not found") {
          const tempRes = await api.post('/checktempvendor', {
            Email_address: username,
          });

          if (tempRes.data.found) {
            setIsPendingApproval(true);
          } else {
            toast.error("Account does not exist.");
            navigate("/signup");
          }
        } else {
          toast.error("Login failed after OTP verification.");
        }
      } else {
        toast.error("Invalid OTP");
      }
    } catch {
      toast.error("OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return toast.warning("Please fill in all fields");
    }

    setLoginMethod("password");
    setIsLoading(true);

    try {
      const res = await api.post('/postusername', {
        username,
        password,
      });

      if (res.data.message === "Success") {
        toast.success("Login successful");
        login(res.data.vendor || { id: res.data.vendorId });
        setVendorId(res.data.vendorId);
      } else if (res.data.message === "User not found") {
        const tempRes = await api.post('/checktempvendor', {
          Email_address: username,
        });

        if (tempRes.data.found) {
          setIsPendingApproval(true);
        } else {
          toast.error("Account not found");
          navigate("/signup");
        }
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Server error during login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login success
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const { email, name } = decoded;

      const res = await api.post('/google-login', {
        email,
        name,
      });

      if (res.data.message === "Success") {
        toast.success("Google login successful");
        const vId = res.data.vendorId;
        login({ id: vId });

        // Fetch category immediately
        const catRes = await api.get(`/api/categories/${vId}`);
        const category = catRes.data.Category.toLowerCase();

        // Navigate based on category
        if (category === "technical" || category === "non-technical") {
          navigate(`/vendor/${vId}`);
        } else {
          navigate(`/product/${vId}`);
        }
      } else if (res.data.message === "User pending approval") {
        setIsPendingApproval(true);
      } else {
        toast.error(res.data.message || "Google login error");
      }
    } catch (error) {
      toast.error("Google login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch category after login
  useEffect(() => {
    if (!vendorId) return;
    api
      .get(`/api/categories/${vendorId}`)
      .then((res) => {
        setTech(res.data.Category);
      })
      .catch((err) => {
        console.error("Category fetch error:", err);
      });
  }, [vendorId]);

  // Navigate based on category
  useEffect(() => {
    if (!vendorId || !tech) return;
    const category = tech.toLowerCase();
    if (category === "technical" || category === "non-technical") {
      navigate(`/vendor/${vendorId}`);
    } else {
      navigate(`/product/${vendorId}`);
    }
  }, [vendorId, tech, navigate]);

  const handleCreateAccount = () => {
    navigate(activeTab === "product" ? "/signup?tab=product" : "/signup");
  };

  const resetLoginState = () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpSent(false);
    setOtpVerified(false);
    setLoginMethod("");
    setPassword("");
  };

  const fadeVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  if (isPendingApproval) {
    return (
      <div className="login-page">
        <div className="login-form-panel">
          <motion.div
            className="pending-approval-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="pending-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <h2 className="pending-title">Approval Pending</h2>
            <p className="pending-subtitle">
              Your registration is being reviewed by our team. You'll receive an email once approved.
            </p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Check Status
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <ToastContainer theme="light" position="top-right" />

      {/* Left Panel - Login Form */}
      <div className="login-form-panel">
        <div className="login-container">
          {/* Brand Logo */}
          <div className="login-brand">
            <div className="brand-icon">
              <img src="/comapny_logo.ico" alt="Apna Mestri" />
            </div>
            <span className="brand-text">Apna Mestri</span>
          </div>

          {/* Tab Switcher */}
          <div className="login-tabs">
            <button
              className={`tab-btn ${activeTab === "vendor" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("vendor");
                resetLoginState();
              }}
            >
              <i className="bi bi-tools"></i>
              Professional
            </button>
            <button
              className={`tab-btn ${activeTab === "product" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("product");
                resetLoginState();
              }}
            >
              <i className="bi bi-box-seam"></i>
              Product
            </button>
          </div>

          {/* Login Card */}
          <motion.div
            className="login-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to continue to your dashboard</p>
            </div>

            {/* Google Login */}
            <div className="social-login-section">
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Google Login Failed")}
                  theme="filled_black"
                  shape="pill"
                  size="large"
                />
              </div>
            </div>

            <div className="social-divider">
              <span>or</span>
            </div>

            <form onSubmit={handlePasswordLogin}>
              {/* Email Field */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper" style={{ display: "flex", gap: "0.5rem" }}>
                  <div className="input-wrapper" style={{ flex: 1, position: "relative" }}>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="you@example.com"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        resetLoginState();
                      }}
                      required
                    />
                  </div>
                  {!otpSent && !otpVerified && (
                    <button
                      type="button"
                      className="btn-otp"
                      onClick={sendOtp}
                      disabled={isLoading || otpTimer > 0}
                    >
                      {isLoading ? (
                        <div className="spinner"></div>
                      ) : otpTimer > 0 ? (
                        formatTime(otpTimer)
                      ) : (
                        "Send OTP"
                      )}
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

              {/* OTP Section */}
              <AnimatePresence>
                {otpSent && !otpVerified && loginMethod === "otp" && (
                  <motion.div
                    className="otp-section"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="otp-header">
                      <div className="otp-icon">
                      </div>
                      <div>
                        <h4 className="otp-title">Enter Verification Code</h4>
                        <p className="otp-subtitle">Sent to {username}</p>
                      </div>
                    </div>

                    <div className="otp-input-group">
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => (otpInputRefs.current[idx] = el)}
                          type="text"
                          maxLength="1"
                          className="otp-digit"
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        />
                      ))}
                    </div>

                    <div className="otp-timer">
                      {otpTimer > 0 ? (
                        <>OTP expires in <strong>{formatTime(otpTimer)}</strong></>
                      ) : (
                        <button
                          type="button"
                          className="signup-link"
                          onClick={sendOtp}
                          style={{ background: "none", border: "none" }}
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      className="btn-success"
                      onClick={verifyOtp}
                      disabled={isLoading}
                      style={{ marginTop: "1rem" }}
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner"></div>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check"></i>
                          Verify OTP
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Password Section */}
              {loginMethod !== "otp" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="input-wrapper">
                      <i className="bi bi-lock input-icon"></i>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-input"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (e.target.value.length > 0) {
                            setLoginMethod("password");
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="login-options">
                    <label className="remember-check">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="custom-checkbox">
                        <i className="bi bi-check"></i>
                      </span>
                      <span className="remember-label">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="forgot-link">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In
                        <i className="bi bi-arrow-right"></i>
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </form>

            <div className="signup-prompt">
              <p>
                Don't have an account?{" "}
                <span className="signup-link" onClick={handleCreateAccount}>
                  Create Account
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Illustration */}
      <div className="login-illustration-panel">
        <div className="illustration-content">
          <div className="illustration-graphic">
            <div className="illustration-circle"></div>
            <div className="illustration-circle"></div>
            <div className="illustration-circle"></div>
            <div className="illustration-icon">
              <i className="bi bi-graph-up-arrow"></i>
            </div>
          </div>

          <h2>Grow Your Business</h2>
          <p>
            Join thousands of vendors who've increased their sales and expanded their customer base with Apna Mestri.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-people-fill"></i>
              </div>
              <span className="feature-text">Connect with customers directly</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-wallet2"></i>
              </div>
              <span className="feature-text">Secure and fast payments</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-bar-chart-line-fill"></i>
              </div>
              <span className="feature-text">Track your performance</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">
                <i className="bi bi-headset"></i>
              </div>
              <span className="feature-text">24/7 support available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
