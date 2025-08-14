import React, { useState, useEffect } from 'react';
import './vendor_settings.css';
import axios from 'axios';

function VendorProfileSettings() {
  const [formdata, setFormData] = useState({
    Business_Name: '',
    Owner_name: '',
    Email_address: '',
    Phone_number: '',
    Business_address: '',
    Category: '',
    Sub_Category: '',
    Tax_ID: '',
    Password: ''
  });
  
  const handleSaveChanges = async () => {
  try {
    const res = await axios.put(`https://backend-d6mx.vercel.app/update/userdetailes/${id}`, formdata);
    alert("Changes saved successfully");
    console.log(res)
  } catch (err) {
    console.error("Failed to save changes", err);
    alert("Failed to save changes");
  }
};

  const id = localStorage.getItem("vendorId");

  useEffect(() => {
  axios
    .get(`https://backend-d6mx.vercel.app/${id}/settings`)
    .then((res) => {
      const data = res.data || {};
      console.log(data)
      setFormData({
        Business_Name: data.datasettings.Business_Name || '',
        Owner_name: data.datasettings.Owner_name || '',
        Email_address: data.datasettings.Email_address || '',
        Phone_number: data.datasettings.Phone_number || '',
        Business_address: data.datasettings.Business_address || '',
        Category: data.datasettings.Category || '',
        Sub_Category: data.datasettings.Sub_Category || '',
        Tax_ID: data.datasettings.Tax_ID || '',
        Password: data.datasettings.Password || ''
        
      });
    })

    .catch((err) => {
      console.error('Failed to fetch vendor data', err);
    });
}, [id]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  return (
    <div>
      
      <div className="container settings_vendor mt-4">
        <h3 className="Settings_Heading mb-4">Account Settings</h3>

        <div className="mb-4">
          <label>Owner Name</label>
          <input
            type="text"
            className="form-control"
            name="Owner_name"
            value={formdata.Owner_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label>Email Address</label>
          <input
            type="email"
            className="form-control"
            name="Email_address"
            value={formdata.Email_address}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label>Phone Number</label>
          <input
            type="text"
            className="form-control"
            name="Phone_number"
            value={formdata.Phone_number}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label>Business Name</label>
          <input
            type="text"
            className="form-control"
            name="Business_Name"
            value={formdata.Business_Name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label>Business Address</label>
          <input
            type="text"
            className="form-control"
            name="Business_address"
            value={formdata.Business_address}
            onChange={handleChange}
          />
        </div>
        <div className="row mb-3">
          <div className="col-md-6">
            <label>Category</label>
            <input
              type="text"
              className="form-control"
              name="Category"
              value={formdata.Category}
              onChange={handleChange}
              readOnly
            />
          </div>
          <div className="col-md-6">
            <label>Sub Category</label>
            <input
              type="text"
              className="form-control"
              name="Sub_Category"
              value={formdata.Sub_Category}
              onChange={handleChange}
              readOnly
            />
          </div>
        </div>
        <div className="mb-4">
          <label>Tax ID / EIN</label>
          <input
            type="text"
            className="form-control"
            name="Tax_ID"
            value={formdata.Tax_ID}
            onChange={handleChange}
          />
        </div>
        <div className="mb-4">
          <label>Password</label>
          <input
            type="password"
            className="form-control"
            name="Password"
            value={formdata.Password}
            onChange={handleChange}
          />
        </div>

        <div className="mb-4">
          <h5 className="section-title">Notification Settings</h5>
          <div className="form-check form-switch">
            <input className="form-check-input" type="checkbox" role="switch" id="jobAlerts" defaultChecked />
            <label className="form-check-label" htmlFor="jobAlerts">New Job Alerts</label>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleSaveChanges}>Save Changes</button>
      </div>
    </div>
  );
}

export default VendorProfileSettings;
