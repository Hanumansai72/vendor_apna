import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

export default function Registration() {
  const navigate = useNavigate();
  const location = useLocation();

  // detect tab
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
  const [chargeType, setChargeType] = useState('Day');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false); // loader state

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
    Charge_Type: 'Day',
    Charge_Per_Hour_or_Day: '',
    descripition: '',
  });

  // update service type
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      Category: registrationType === 'Product' ? prev.Category : selectedServiceType,
      Sub_Category: [],
    }));
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
    setFormData(prev => ({ ...prev, Category: type, Sub_Category: [] }));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      try {
        const res = await fetch(
          `https://us1.locationiq.com/v1/reverse?key=pk.b6ebdeccc1f35c3e45b72aba8fec713c&lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const address = (data.display_name || '').split(',').slice(0, 3).join(', ');
        setFormData(prev => ({
          ...prev,
          Business_address: address,
          Latitude: latitude.toString(),
          Longitude: longitude.toString(),
        }));
      } catch {
        toast.error('Location fetch failed');
      }
    }, () => toast.error('Location access denied'));
  };

  const handleSendOtp = async () => {
    if (!formData.Email_address) return toast.warning('Enter your email');
    try {
      await axios.post('https://backend-d6mx.vercel.app/sendotp', { Email: formData.Email_address });
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
      await axios.post('https://backend-d6mx.vercel.app/verifyotp', {
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

    if (formData.Password && formData.Password !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (!otpVerified) return toast.error('Please verify your OTP');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      imageFiles.forEach(file => data.append('productImages', file));
      if (profilePic) data.append('profileImage', profilePic);

      await axios.post('https://backend-d6mx.vercel.app/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Registration successful!');
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error('Registration failed');
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    setFormData(prev => ({
      ...prev,
      Owner_name: decoded.name,
      Email_address: decoded.email,
    }));
    toast.success(`Google signup success: ${decoded.email}`);
    setStep(2); // jump to step 2 automatically
  };

  const nextStep = () => {
    setLoading(true);
    setTimeout(() => {
      setStep(prev => prev + 1);
      setLoading(false);
    }, 600); // simulate loading delay
  };

  const prevStep = () => setStep(prev => prev - 1);

  return (
    <div className="container my-5">
      <ToastContainer />
      <form className="card p-4 shadow" onSubmit={handleSubmit}>
        <h2 className="text-center mb-4">Register as a {registrationType}</h2>
        <h6 className="text-center text-muted mb-4">Step {step} of 3</h6>

        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-dark" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2">Loading next step...</p>
          </div>
        ) : (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <div className="row g-3">
                <h5 className="mb-3">Step 1 – Basic Information</h5>

                <div className="col-md-6">
                  <label>Business Name</label>
                  <input className="form-control" name="Business_Name" value={formData.Business_Name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>Owner Name</label>
                  <input className="form-control" name="Owner_name" value={formData.Owner_name} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>Email</label>
                  <div className="input-group">
                    <input type="email" className="form-control" name="Email_address" value={formData.Email_address} onChange={handleChange} required />
                    <button className="btn btn-outline-primary" type="button" onClick={handleSendOtp} disabled={otpTimer > 0}>
                      {otpTimer > 0 ? `Resend in ${Math.floor(otpTimer / 60)}:${(otpTimer % 60).toString().padStart(2, '0')}` : 'Send OTP'}
                    </button>
                  </div>
                </div>
                {showOtp && (
                  <div className="col-md-6">
                    <label>Enter OTP</label>
                    <input className="form-control" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                    <button type="button" className="btn btn-success mt-2" onClick={verifyOtp}>Verify OTP</button>
                  </div>
                )}
                <div className="col-md-6">
                  <label>Phone</label>
                  <input className="form-control" name="Phone_number" value={formData.Phone_number} onChange={handleChange} required />
                </div>
                <div className="col-md-9">
                  <label>Business Address</label>
                  <input className="form-control" name="Business_address" value={formData.Business_address} onChange={handleChange} required />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="button" className="btn btn-outline-secondary w-100" onClick={handleLocateMe}>📍 Locate Me</button>
                </div>
                <div className="col-md-6">
                  <label>Password</label>
                  <input type="password" className="form-control" name="Password" value={formData.Password} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>Confirm Password</label>
                  <input type="password" className="form-control" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>

                <div className="col-12 text-center mt-4">
                  <button type="button" className="btn btn-dark px-5" onClick={nextStep}>Next</button>
                </div>

                {/* Google Signup Button */}
                <div className="col-12 text-center mt-3">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Login Failed')}
                    size="small"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="row g-3">
                <h5 className="mb-3">Step 2 – Category & Service Details</h5>

                {registrationType === 'Service' && (
                  <>
                    <div className="col-md-12">
                      <label>Service Type</label>
                      <div>
                        {['Technical', 'Non-Technical'].map(type => (
                          <button
                            key={type}
                            type="button"
                            className={`btn me-2 ${selectedServiceType === type ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => handleServiceTypeClick(type)}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="col-md-12">
                      <label>Select Sub-Categories</label>
                      <div className="d-flex flex-wrap gap-2">
                        {subCategories[selectedServiceType].map(sub => (
                          <button
                            key={sub}
                            type="button"
                            className={`btn btn-sm ${formData.Sub_Category.includes(sub) ? 'btn-success' : 'btn-outline-secondary'}`}
                            onClick={() =>
                              setFormData(prev => ({
                                ...prev,
                                Sub_Category: prev.Sub_Category.includes(sub)
                                  ? prev.Sub_Category.filter(s => s !== sub)
                                  : [...prev.Sub_Category, sub],
                              }))
                            }
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {registrationType === 'Product' && (
                  <div className="col-md-6">
                    <label>Category</label>
                    <input className="form-control" name="Category" value={formData.Category} onChange={handleChange} required />
                  </div>
                )}

                <div className="col-md-6">
                  <label>Charge Type</label>
                  <select className="form-control" name="Charge_Type" value={formData.Charge_Type} onChange={handleChange}>
                    <option value="Day">Per Day</option>
                    <option value="Hour">Per Hour</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label>Charge</label>
                  <input className="form-control" name="Charge_Per_Hour_or_Day" value={formData.Charge_Per_Hour_or_Day} onChange={handleChange} required />
                </div>

                <div className="col-12 text-center mt-4">
                  <button type="button" className="btn btn-secondary me-2" onClick={prevStep}>Back</button>
                  <button type="button" className="btn btn-dark px-5" onClick={nextStep}>Next</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="row g-3">
                <h5 className="mb-3">Step 3 – Documents & Final</h5>

                <div className="col-md-6">
                  <label>ID Type</label>
                  <select className="form-control" name="ID_Type" value={idType} onChange={e => setIdType(e.target.value)}>
                    <option value="PAN">PAN</option>
                    <option value="Aadhar">Aadhar</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label>Tax ID</label>
                  <input className="form-control" name="Tax_ID" value={formData.Tax_ID} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>Account Number</label>
                  <input className="form-control" name="Account_Number" value={formData.Account_Number} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label>IFSC Code</label>
                  <input className="form-control" name="IFSC_Code" value={formData.IFSC_Code} onChange={handleChange} required />
                </div>
                <div className="col-md-12">
                  <label>Description</label>
                  <textarea className="form-control" name="descripition" value={formData.descripition} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6">
                  <label>Profile Picture</label>
                  <input type="file" className="form-control" onChange={e => setProfilePic(e.target.files[0])} />
                </div>
                <div className="col-md-6">
                  <label>Upload Documents</label>
                  <input type="file" className="form-control" multiple onChange={e => setImageFiles([...e.target.files])} />
                </div>

                <div className="col-12 text-center mt-4">
                  <button type="button" className="btn btn-secondary me-2" onClick={prevStep}>Back</button>
                  <button type="submit" className="btn btn-success px-5">Submit</button>
                </div>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
