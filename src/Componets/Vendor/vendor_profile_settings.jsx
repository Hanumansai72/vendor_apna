import React, { useState, useEffect } from 'react';
import './vendor_settings.css';
import axios from 'axios';

function VendorProfileSettings() {
  const [formData, setFormData] = useState({
    Business_Name: '',
    Owner_name: '',
    Email_address: '',
    Phone_number: '',
    Business_address: '',
    Category: '',
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
    description: ''
  });
  const [profilePic, setProfilePic] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const id = localStorage.getItem("vendorId");

  // Automatically use user's location on page load
  useEffect(() => {
    if (!formData.Latitude || !formData.Longitude || !formData.Business_address) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async position => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          let address = "";

          try {
            const osmRes = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            if (osmRes.data && osmRes.data.display_name) {
              address = osmRes.data.display_name;
            }
          } catch (err) {
            address = '';
          }

          setFormData(prev => ({
            ...prev,
            Latitude: lat,
            Longitude: lng,
            Business_address: address
          }));
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch vendor's saved data
  useEffect(() => {
    if (id) {
      axios
        .get(`https://backend-d6mx.vercel.app/${id}/settings`)
        .then((res) => {
          const data = res.data?.datasettings || {};
          setFormData({
            Business_Name: data.Business_Name || '',
            Owner_name: data.Owner_name || '',
            Email_address: data.Email_address || '',
            Phone_number: data.Phone_number || '',
            Business_address: data.Business_address || '',
            Category: data.Category || '',
            Sub_Category: Array.isArray(data.Sub_Category)
              ? data.Sub_Category
              : (typeof data.Sub_Category === "string" ? data.Sub_Category.split(",") : []),
            Tax_ID: data?.Tax_ID || '',
            Password: data?.Password || '',
            Latitude: data?.Latitude || '',
            Longitude: data?.Longitude || '',
            ID_Type: data?.ID_Type || 'PAN',
            Account_Number: data?.Account_Number || '',
            IFSC_Code: data?.IFSC_Code || '',
            Charge_Type: data?.Charge_Type || 'Day',
            Charge_Per_Hour_or_Day: data?.Charge_Per_Hour_or_Day || '',
            description: data?.description || ''
          });
        })
        .catch((err) => {
          console.error('Failed to fetch vendor data', err);
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Sub_Category' ? value.split(',').map(s => s.trim()) : value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const sendData = new FormData();
      Object.keys(formData).forEach(key => {
        if (Array.isArray(formData[key])) {
          sendData.append(key, formData[key].join(','));
        } else {
          sendData.append(key, formData[key]);
        }
      });
      if (profilePic) sendData.append('profileImage', profilePic);
      if (imageFiles.length > 0)
        imageFiles.forEach(file => sendData.append('productImages', file));
      await axios.put(`https://backend-d6mx.vercel.app/update/userdetailes/${id}`, sendData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Changes saved successfully");
    } catch (err) {
      console.error("Failed to save changes", err);
      alert("Failed to save changes");
    }
  };

  return (
    <div>
      <div className="container settings_vendor mt-4">
        <h3 className="Settings_Heading mb-4">Account Settings</h3>
        <div className="mb-4">
          <label>Business Name</label>
          <input type="text" className="form-control" name="Business_Name" value={formData.Business_Name} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Owner Name</label>
          <input type="text" className="form-control" name="Owner_name" value={formData.Owner_name} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Email Address</label>
          <input type="email" className="form-control" name="Email_address" value={formData.Email_address} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Phone Number</label>
          <input type="text" className="form-control" name="Phone_number" value={formData.Phone_number} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Business Address</label>
          <input type="text" className="form-control" name="Business_address" value={formData.Business_address} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Category</label>
          <input type="text" className="form-control" name="Category" value={formData.Category} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Sub Category (comma separated)</label>
          <input type="text" className="form-control" name="Sub_Category" value={formData.Sub_Category.join(',')} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Tax ID</label>
          <input type="text" className="form-control" name="Tax_ID" value={formData.Tax_ID} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Password</label>
          <input type="password" className="form-control" name="Password" value={formData.Password} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>ID Type</label>
          <select className="form-control" name="ID_Type" value={formData.ID_Type} onChange={handleChange}>
            <option value="PAN">PAN</option>
            <option value="Aadhar">Aadhar</option>
          </select>
        </div>
        <div className="mb-4">
          <label>Account Number</label>
          <input type="text" className="form-control" name="Account_Number" value={formData.Account_Number} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>IFSC Code</label>
          <input type="text" className="form-control" name="IFSC_Code" value={formData.IFSC_Code} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Charge Type</label>
          <select className="form-control" name="Charge_Type" value={formData.Charge_Type} onChange={handleChange}>
            <option value="Day">Per Day</option>
            <option value="Hour">Per Hour</option>
          </select>
        </div>
        <div className="mb-4">
          <label>Charge Per Hour or Day</label>
          <input type="number" className="form-control" name="Charge_Per_Hour_or_Day" value={formData.Charge_Per_Hour_or_Day} onChange={handleChange} />
        </div>
        <div className="mb-4">
          <label>Description</label>
          <textarea name="description" className="form-control" value={formData.description} onChange={handleChange}></textarea>
        </div>
        <div className="mb-4">
          <label>Profile Picture</label>
          <input type="file" className="form-control" onChange={e => setProfilePic(e.target.files[0])} />
        </div>
        <div className="mb-4">
          <label>Upload Documents</label>
          <input type="file" className="form-control" multiple onChange={e => setImageFiles([...e.target.files])} />
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
