import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

export default function Registration() {
const navigate = useNavigate();
const location = useLocation();

// Detect tab
const getRegistrationType = () =>
new URLSearchParams(location.search).get('tab') === 'product' ? 'Product' : 'Service';

const [registrationType] = useState(getRegistrationType());
const [selectedServiceType, setSelectedServiceType] = useState('Technical');
const [confirmPassword, setConfirmPassword] = useState('');
const [idType, setIdType] = useState('PAN');
const [imageFiles, setImageFiles] = useState([]);
const [profilePic, setProfilePic] = useState(null);
const [showOtp, setShowOtp] = useState(false);
const [otp, setOtp] = useState('');
const [otpVerified, setOtpVerified] = useState(false);
const [otpTimer, setOtpTimer] = useState(0);
const [step, setStep] = useState(1);
const [loading, setLoading] = useState(false); // loader state
const [isGoogleUser, setIsGoogleUser] = useState(false);

const subCategories = {
Technical: [
'Architects', 'Civil Engineer', 'Site Supervisor', 'Survey Engineer', 'MEP Consultant',
'Structural Engineer', 'Project Manager', 'HVAC Engineer', 'Safety Engineer', 'Contractor',
'Interior Designer', 'WaterProofing Consultant', 'Acoustic Consultants'
],
'Non-Technical': [
'EarthWork Labour', 'Civil Mason', 'Shuttering/Centring Labour', 'Plumber',
'Electrician', 'Painter', 'Carpenter', 'Flooring Labour', 'False Ceiling Worker'
],
};

const [formData, setFormData] = useState({
Business_Name: '',
Owner_name: '',
Email_address: '',
Phone_number: '',
Business_address: '',
Category: registrationType === 'Product' ? '' : 'Technical',
Sub_Category: [],
Tax_ID: '',
Password: '',
Latitude: '',
Longitude: '',
ID_Type: 'PAN',
Account_Number: '',
IFSC_Code: '',
descripition: '',
});

// update service type
useEffect(() => {
if (registrationType !== 'Product') {
setFormData(prev => ({
...prev,
Category: selectedServiceType,
Sub_Category: [],
}));
}
}, [registrationType, selectedServiceType]);

// otp timer countdown
useEffect(() => {
let timer;
if (otpTimer > 0) {
timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
}
return () => clearTimeout(timer);
}, [otpTimer]);

const handleChange = e => {
const { name, value } = e.target;
setFormData(prev => ({ ...prev, [name]: value }));
};

const handleServiceTypeClick = type => {
setSelectedServiceType(type);
};

const handleSendOtp = async () => {
if (!formData.Email_address) return toast.warning('Enter your email');
try {
await axios.post('[https://backend-d6mx.vercel.app/sendotp](https://backend-d6mx.vercel.app/sendotp)', { Email: formData.Email_address });
toast.success('OTP sent to your email!');
setShowOtp(true);
setOtpTimer(300);
} catch {
toast.error('Failed to send OTP');
}
};

const verifyOtp = async () => {
if (!otp) return toast.warning('Please enter the OTP');
try {
await axios.post('[https://backend-d6mx.vercel.app/verifyotp](https://backend-d6mx.vercel.app/verifyotp)', {
Email: formData.Email_address,
otp,
});
toast.success('OTP verified!');
setOtpVerified(true);
} catch {
toast.error('Invalid OTP');
}
};

const handleSubmit = async e => {
e.preventDefault();


// Check passwords only for normal (non-Google) users
if (!isGoogleUser && step === 1 && formData.Password !== confirmPassword) {
  return toast.error('Passwords do not match');
}
if (!isGoogleUser && step === 1 && !otpVerified) {
  return toast.error('Please verify your OTP');
}

// For normal users, allow submit only on Step 3; for Google users, only Step 2
if ((!isGoogleUser && step !== 3) || (isGoogleUser && step !== 2)) {
  return toast.error('Please complete all required steps before submitting.');
}

setLoading(true);
try {
  const data = new FormData();
  Object.keys(formData).forEach(key => {
    // For Google signup, skip password field
    if (isGoogleUser && key === 'Password') return;
    data.append(key, formData[key]);
  });
  data.append('isGoogleSignup', isGoogleUser);

  if (imageFiles.length > 0) imageFiles.forEach(file => data.append('productImages', file));
  if (profilePic) data.append('profileImage', profilePic);

  await axios.post('https://backend-d6mx.vercel.app/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  toast.success('Registration successful!');
  navigate('/');
} catch (err) {
  console.error(err);
  toast.error('Registration failed');
} finally {
  setLoading(false);
}


};

const nextStep = () => {
// Validate Step 1 only for normal signup
if (!isGoogleUser && step === 1) {
if (!formData.Business_Name || !formData.Owner_name || !formData.Email_address || !formData.Password) {
return toast.error('Please fill all required fields in Step 1');
}
if (formData.Password !== confirmPassword) {
return toast.error('Passwords do not match');
}
if (!otpVerified) {
return toast.error('Please verify OTP before proceeding');
}
}
setLoading(true);
setTimeout(() => {
setStep(prev => prev + 1);
setLoading(false);
}, 600);
};

const prevStep = () => setStep(prev => prev - 1);

// Google signup handler - skips Steps 1 and 3, goes to Step 2 directly
// Google signup handler
const handleGoogleSignup = async (credentialResponse) => {
  try {
    const decoded = jwtDecode(credentialResponse.credential);

    // If user is registering as a Product → direct signup
    if (registrationType === "Product") {
      const data = new FormData();
      data.append("Owner_name", decoded.name || "");
      data.append("Email_address", decoded.email || "");
      data.append("isGoogleSignup", true);

      // If Google profile pic exists, attach it
      if (decoded.picture) {
        const res = await fetch(decoded.picture);
        const blob = await res.blob();
        const file = new File([blob], "profile.jpg", { type: blob.type });
        data.append("profileImage", file);
      }

      setLoading(true);
      await axios.post("https://backend-d6mx.vercel.app/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Google signup successful! Please login.");
      navigate("/login"); // redirect to login page
      return; // ✅ stop here
    }

    // Else (Service registration) → fill form manually (Step 2)
    setFormData(prev => ({
      ...prev,
      Owner_name: decoded.name,
      Email_address: decoded.email,
    }));
    setIsGoogleUser(true);
    if (registrationType !== "Product") {
      setStep(2);
    }
    toast.success("Google signup successful! Please fill extra details.");
  } catch (err) {
    console.error(err);
    toast.error("Google signup failed");
  } finally {
    setLoading(false);
  }
};


return ( <div className="container my-5"> <ToastContainer /> <form className="card p-4 shadow" onSubmit={handleSubmit}> <h2 className="text-center mb-4">Register as a {registrationType}</h2> <h6 className="text-center text-muted mb-4">Step {step} of {isGoogleUser ? 2 : 3}</h6>


    {loading ? (
      <div className="text-center my-5">
        <div className="spinner-border text-dark" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading...</p>
      </div>
    ) : (
      <>
        {/* Step 1 - only normal users */}
        {step === 1 && !isGoogleUser && (
          <>
            <div className="mb-3">
              <label>Business Name</label>
              <input name="Business_Name" className="form-control" value={formData.Business_Name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Owner Name</label>
              <input name="Owner_name" className="form-control" value={formData.Owner_name} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Email Address</label>
              <input name="Email_address" type="email" className="form-control" value={formData.Email_address} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input name="Password" type="password" className="form-control" value={formData.Password} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Confirm Password</label>
              <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Email OTP</label>
              <button className="btn btn-outline-primary" type="button" onClick={handleSendOtp} disabled={otpTimer > 0}>
                {otpTimer > 0 ? `Resend in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : 'Send OTP'}
              </button>
              {showOtp && (
                <input
                  className="form-control mt-2"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  placeholder="Enter OTP"
                  required
                />
              )}
              {showOtp && (
                <button className="btn btn-success mt-2" type="button" onClick={verifyOtp}>
                  Verify OTP
                </button>
              )}
            </div>
            <div className="text-center mt-4">
              <button type="button" className="btn btn-dark px-5" onClick={nextStep}>Next</button>
            </div>
            <div className="text-center mt-3">
              <p>Or sign up with:</p>
              <GoogleLogin onSuccess={handleGoogleSignup} onError={() => toast.error('Google Login Failed')} size="large" shape="pill" theme="outline" />
            </div>
          </>
        )}

        {/* Step 2 - Both normal and Google */}
        {step === 2 && !(isGoogleUser && registrationType === "Product") && (

          <>
            {registrationType === 'Service' && (
              <>
                <div className="mb-3">
                  <label>Service Type</label>
                  <div>
                    {['Technical', 'Non-Technical'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`btn me-2 ${selectedServiceType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedServiceType(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label>Select Sub-Categories</label>
                  <div className="d-flex flex-wrap gap-2">
                    {subCategories[selectedServiceType].map(sub => (
                      <button
                        key={sub}
                        type="button"
                        className={`btn btn-sm ${formData.Sub_Category.includes(sub) ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={() => {
                          const updated = formData.Sub_Category.includes(sub)
                            ? formData.Sub_Category.filter(s => s !== sub)
                            : [...formData.Sub_Category, sub];
                          setFormData(prev => ({ ...prev, Sub_Category: updated }));
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label>Charge Type</label>
                  <select name="Charge_Type" className="form-control" value={formData.Charge_Type || ''} onChange={handleChange}>
                    <option value="Day">Per Day</option>
                    <option value="Hour">Per Hour</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label>Charge</label>
                  <input name="Charge_Per_Hour_or_Day" className="form-control" value={formData.Charge_Per_Hour_or_Day || ''} onChange={handleChange} />
                </div>
              </>
            )}

            {registrationType === 'Product' && (
              <div className="mb-3">
                <label>Category</label>
                <input name="Category" className="form-control" value={formData.Category} onChange={handleChange} required />
              </div>
            )}

            <div className="d-flex justify-content-between">
              {!isGoogleUser && (
                <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
              )}
              <button type={isGoogleUser ? "submit" : "button"} className="btn btn-primary" onClick={isGoogleUser ? null : nextStep}>
                {isGoogleUser ? "Register" : "Next"}
              </button>
            </div>
          </>
        )}

        {/* Step 3 - Only normal signup */}
        {step === 3 && !isGoogleUser && (
          <>
            <div className="mb-3">
              <label>ID Type</label>
              <select name="ID_Type" className="form-control" value={idType} onChange={e => setIdType(e.target.value)}>
                <option value="PAN">PAN</option>
                <option value="Aadhar">Aadhar</option>
              </select>
            </div>

            <div className="mb-3">
              <label>Tax ID</label>
              <input name="Tax_ID" className="form-control" value={formData.Tax_ID} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label>Account Number</label>
              <input name="Account_Number" className="form-control" value={formData.Account_Number} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label>IFSC Code</label>
              <input name="IFSC_Code" className="form-control" value={formData.IFSC_Code} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label>Description</label>
              <textarea name="descripition" className="form-control" value={formData.descripition} onChange={handleChange}></textarea>
            </div>

            <div className="mb-3">
              <label>Profile Picture</label>
              <input type="file" className="form-control" onChange={e => setProfilePic(e.target.files[0])} />
            </div>

            <div className="mb-3">
              <label>Upload Documents</label>
              <input type="file" className="form-control" multiple onChange={e => setImageFiles([...e.target.files])} />
            </div>

            <div className="d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={prevStep}>Back</button>
              <button type="submit" className="btn btn-success">Register</button>
            </div>
          </>
        )}
      </>
    )}
  </form>
</div>


);
}
