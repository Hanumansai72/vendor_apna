import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GoogleLogin } from "@react-oauth/google";
import {jwtDecode} from "jwt-decode";
import AdminApprovalPending from "../../Vendor/Adminapprovalpage";

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState("vendor");
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [tech, setTech] = useState("");
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [loginMethod, setLoginMethod] = useState(""); // "otp" or "password"

  // Send OTP for email login
  const sendOtp = async () => {
    try {
      await axios.post("https://backend-d6mx.vercel.app/sendotp", { Email: username });
      toast.success("OTP sent to your email");
      setOtpSent(true);
      setLoginMethod("otp");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  // Verify OTP and login
  const verifyOtp = async () => {
    try {
      const res = await axios.post("https://backend-d6mx.vercel.app/verifyotp", {
        Email: username,
        otp: otp,
      });

      if (res.data.message === "OTP verified") {
        toast.success("OTP verified successfully");
        setOtpVerified(true);

        // After OTP verified, login via OTP
        const loginRes = await axios.post("https://backend-d6mx.vercel.app/loginwith-otp", {
          email: username,
        });

        if (loginRes.data.message === "Success" && loginRes.data.vendorId) {
          localStorage.setItem("vendorId", loginRes.data.vendorId);
          setVendorId(loginRes.data.vendorId);
        } else if (loginRes.data.message === "User not found") {
          const tempRes = await axios.post("https://backend-d6mx.vercel.app/checktempvendor", {
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
    }
  };

  // Handle password login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoginMethod("password");

    try {
      const res = await axios.post("https://backend-d6mx.vercel.app/postusername", {
        username,
        password,
      });

      if (res.data.message === "Success") {
        toast.success("Login successful");
        localStorage.setItem("vendorId", res.data.vendorId);
        setVendorId(res.data.vendorId);
      } else if (res.data.message === "User not found") {
        const tempRes = await axios.post("https://backend-d6mx.vercel.app/checktempvendor", {
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
    }
  };

  // Handle Google Login success
  const handleGoogleSuccess = async (credentialResponse) => {
  try {
    const decoded = jwtDecode(credentialResponse.credential);
    const { email, name } = decoded;

    const res = await axios.post("https://backend-d6mx.vercel.app/google-login", {
      email,
      name,
    });

    if (res.data.message === "Success") {
      toast.success("Google login successful");
      const vendorId = res.data.vendorId;
      localStorage.setItem("vendorId", vendorId);

      // Fetch category immediately
      const catRes = await axios.get(`https://backend-d6mx.vercel.app/api/categories/${vendorId}`);
      const category = catRes.data.Category.toLowerCase();

      // Navigate based on category
      if (category === "technical" || category === "non-technical") {
        navigate(`/vendor/${vendorId}`);
      } else {
        navigate(`/product/${vendorId}`);
      }
    } else if (res.data.message === "User pending approval") {
      setIsPendingApproval(true);
    } else {
      toast.error(res.data.message || "Google login error");
    }
  } catch (error) {
    toast.error("Google login failed");
  }
};

  // Fetch category after login
  useEffect(() => {
    if (!vendorId) return;
    axios
      .get(`https://backend-d6mx.vercel.app/api/categories/${vendorId}`)
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

  if (isPendingApproval) {
    return <AdminApprovalPending />;
  }

  return (
    <div className="d-flex vh-100 flex-column flex-md-row">
      <ToastContainer />
      <div className="w-100 w-md-50 d-flex flex-column justify-content-center align-items-center p-4">
        <div className="d-flex mb-4">
          <button
            onClick={() => setActiveTab("vendor")}
            className={`btn ${
              activeTab === "vendor" ? "btn-warning text-white" : "btn-light text-secondary"
            } me-2`}
          >
            Professional
          </button>
          <button
            onClick={() => setActiveTab("product")}
            className={`btn ${
              activeTab === "product" ? "btn-warning text-white" : "btn-light text-secondary"
            }`}
          >
            Product
          </button>
        </div>

        <div className="w-100 px-3" style={{ maxWidth: "500px" }}>
          <h2 className="mb-4">{activeTab === "vendor" ? "Vendor Login" : "Product Login"}</h2>

          {/* Google Login Button */}
          <div className="mb-3 d-flex justify-content-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error("Google Login Failed")} />
          </div>

          <form className="mb-3 w-100" onSubmit={handlePasswordLogin}>
            {/* Email + OTP Buttons */}
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <div className="d-flex">
                <input
                  type="email"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setOtp("");
                    setOtpSent(false);
                    setOtpVerified(false);
                    setLoginMethod("");
                    setPassword("");
                  }}
                  className="form-control me-2"
                  placeholder="you@example.com"
                  required
                />
                {!otpSent && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={sendOtp}>
                    Send OTP
                  </button>
                )}
                {otpSent && !otpVerified && (
                  <button type="button" className="btn btn-success btn-sm" onClick={verifyOtp}>
                    Verify OTP
                  </button>
                )}
              </div>
            </div>

            {/* OTP Input */}
            {loginMethod === "otp" && otpSent && !otpVerified && (
              <div className="mb-3">
                <label>Enter OTP</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            )}

            {loginMethod === "otp" && otpVerified && (
              <div className="text-success fw-bold mb-3">✅ OTP Verified</div>
            )}

            {/* Password Field */}
            {loginMethod !== "otp" && (
              <>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (e.target.value.length > 0) {
                        setLoginMethod("password");
                      }
                    }}
                    className="form-control"
                    placeholder="********"
                  />
                </div>

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                  <a href="/" className="text-warning small">
                    Forgot Password?
                  </a>
                </div>

                <button type="submit" className="btn btn-warning w-100 text-white">
                  Log In
                </button>
              </>
            )}
          </form>

          <p className="text-center mt-3 small">
            Don't have an account?{" "}
            <button
              onClick={handleCreateAccount}
              className="text-warning bg-transparent border-0 p-0 text-decoration-underline"
              style={{ cursor: "pointer" }}
            >
              Create Account
            </button>
          </p>
        </div>
      </div>

      <div className="w-50 d-none d-md-flex justify-content-center align-items-center bg-light">
        <div className="text-center" style={{ maxWidth: "400px" }}>
          <img
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c8dd26861f-39ad2f8afe79905fbe9e.png"
            alt="Illustration"
            className="img-fluid mb-4"
          />
          <h3 className="fw-bold mb-2">Grow Your Business</h3>
          <p className="text-muted">
            Join thousands of vendors who've increased their sales and expanded their customer base.
          </p>
        </div>
      </div>
    </div>
  );
}
