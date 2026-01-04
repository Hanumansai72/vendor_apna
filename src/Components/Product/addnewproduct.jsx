import React, { useCallback, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductNavbar from "./productnav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";
import axios from "axios";
import { api } from "../../config";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

const categoryBrands = {
  Cement: { subCategories: ["UltraTech", "ACC", "Ambuja", "Dalmia", "Ramco"] },
  Steel: { subCategories: ["TATA Tiscon", "JSW Steel", "Jindal Panther", "SAIL"] },
  Plumbing: { subCategories: ["Ashirvad", "Astral", "Prince", "Supreme"] },
  Electrical: { subCategories: ["Havells", "Finolex", "Polycab", "RR Kabel"] },
  Paints: { subCategories: ["Asian Paints", "Berger", "Nerolac", "Indigo"] },
  Bricks: { subCategories: ["Wienerberger", "Porotherm", "Jindal Bricks"] },
  Sand: { subCategories: ["Robo Sand", "River Sand", "M-Sand"] },
  Aggregates: { subCategories: ["20mm Aggregate", "40mm Aggregate", "10mm Aggregate"] },
  Concrete: { subCategories: ["RMC India", "Ultratech RMC", "ACC Ready Mix"] },
  Tiles: { subCategories: ["Kajaria", "Somany", "Nitco", "Johnson"] },
  Glass: { subCategories: ["Saint-Gobain", "AIS Glass", "Modiguard"] },
  Doors: { subCategories: ["Greenply", "CenturyPly", "Kitply", "Fenesta"] },
  Windows: { subCategories: ["Fenesta", "UPVC India", "Windoor"] },
  Roofing: { subCategories: ["Tata Shaktee", "Everest", "JSW Colouron+"] },
  GroutsSealants: { subCategories: ["Dr. Fixit", "MYK LATICRETE", "Roff"] },
  Lighting: { subCategories: ["Philips", "Syska", "Wipro", "Halonix"] },
  Kitchen: { subCategories: ["Hettich", "Häfele", "Godrej Interio"] },
  Wardrobe: { subCategories: ["Godrej", "Durian", "Urban Ladder"] },
  Wallpaper: { subCategories: ["Nilaya", "Excel", "Marburg"] },
  Curtains: { subCategories: ["D'Decor", "Fabindia", "Spaces"] },
  Furniture: { subCategories: ["IKEA", "Urban Ladder", "Pepperfry"] },
  BathroomFittings: { subCategories: ["Jaquar", "Kohler", "Hindware"] },
  FalseCeiling: { subCategories: ["Gyproc", "Armstrong", "USG Boral"] },
  Flooring: { subCategories: ["Pergo", "Greenlam", "Squarefoot"] },
  ModularFurniture: { subCategories: ["Godrej Interio", "Featherlite", "Zuari"] },
  DecorativePanels: { subCategories: ["Merino", "Greenlam", "Century Laminates"] },
  SmartHome: { subCategories: ["Schneider", "Anchor", "Legrand"] },
};

const AddProductForm = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    subCategory: "",
    price: "",
    discountedprice: "",
    stock: "",
    location: "",
    tags: "",
    description: "",
    productImages: [],
    ProductModelNumber: "",
    isAvailable: true,
  });

  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [material, setMaterial] = useState("");
  const [uom, setUom] = useState("Piece");
  const [moq, setMoq] = useState("1");
  const [agree, setAgree] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [previews, setPreviews] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData((prev) => ({ ...prev, productImages: files }));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onDrop = useCallback((ev) => {
    ev.preventDefault();
    setDragOver(false);
    const files = Array.from(ev.dataTransfer.files || []).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (files.length) {
      setFormData((prev) => ({ ...prev, productImages: files }));
      setPreviews(files.map((f) => URL.createObjectURL(f)));
    }
  }, []);

  const onDragOver = (ev) => {
    ev.preventDefault();
    setDragOver(true);
  };
  const onDragLeave = () => setDragOver(false);

  const handleGenerateContent = async () => {
    const { category, subCategory } = formData;
    if (!category || !subCategory) {
      toast.warn("Please select both category and sub-category first.");
      return;
    }
    setLoadingAI(true);
    try {
      const res = await api.post(`/generate-content`, {
        category,
        subCategory,
      });

      const description = res?.data?.content?.des || "";
      const rawTags = res?.data?.content?.tag;
      const tags = Array.isArray(rawTags) ? rawTags.join(", ") : rawTags || "";

      setFormData((prev) => ({
        ...prev,
        description: description || prev.description,
        tags: tags || prev.tags,
      }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to auto-generate description and tags.");
    } finally {
      setLoadingAI(false);
    }
  };

  const checklist = useMemo(() => {
    return {
      name: !!formData.productName?.trim(),
      category: !!formData.category && !!formData.subCategory,
      description: !!formData.description?.trim(),
      price: !!formData.price,
      stock: !!formData.stock,
      images: formData.productImages?.length > 0,
    };
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agree) {
      toast.warn("Please agree to the Terms before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrls = [];
      for (const image of formData.productImages) {
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", image);
        cloudinaryData.append("upload_preset", "myupload");
        cloudinaryData.append("cloud_name", "dqxsgmf33");

        const cloudRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dqxsgmf33/image/upload",
          cloudinaryData
        );
        imageUrls.push(cloudRes?.data?.secure_url);
      }

      const productPayload = {
        Vendor: vendorId,
        ProductName: formData.productName,
        ProductPrice: formData.price,
        ProductStock: formData.stock,
        ProductDescription: formData.description,
        ProductTags: formData.tags,
        ProductCategory: formData.category,
        ProductSubCategory: formData.subCategory,
        ProductLocation: formData.location,
        ProductUrl: imageUrls,
        discountedprice: formData.discountedprice,
        ProductModelNumber: formData.ProductModelNumber || "",
        Weight: weight || "",
        UnitofMeasurement: uom || "Piece",
        MinimumOrderQuantity: moq || "1",
        isAvailable: formData.isAvailable,
      };

      await api.post(`/addproduct`, productPayload);
      toast.success("Product submitted successfully!");
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    const draft = { ...formData, savedAt: Date.now() };
    localStorage.setItem("apnaMestri_product_draft", JSON.stringify(draft));
    toast.success("Draft saved locally!");
  };

  const fade = { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="add-product-page">
      <ProductNavbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="add-product-container">
        {/* Header Section */}
        <motion.div {...fade} transition={{ duration: 0.35 }} className="page-header-card">
          <div className="header-icon">
            <i className="bi bi-plus-circle-fill"></i>
          </div>
          <h1 className="page-title">Add New Product</h1>
          <p className="page-subtitle">Fill in the details to list your product on Apna Mestri marketplace.</p>
          <div className="header-underline"></div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="form-section-card">
            <div className="section-header">
              <div className="section-icon">
                <i className="bi bi-info-circle-fill"></i>
              </div>
              <div>
                <h3 className="section-title">Basic Information</h3>
                <p className="section-subtitle">Enter the fundamental details of your product</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  <i className="bi bi-tag-fill"></i>
                  Product Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="productName"
                  className="form-input"
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-grid-fill"></i>
                  Category <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="category"
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => {
                      setFormData((p) => ({ ...p, category: e.target.value, subCategory: "" }));
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    {Object.keys(categoryBrands).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <i className="bi bi-chevron-down select-arrow"></i>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-diagram-3-fill"></i>
                  Subcategory <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="subCategory"
                    className="form-select"
                    value={formData.subCategory}
                    onChange={handleInputChange}
                    disabled={!formData.category}
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {formData.category &&
                      categoryBrands[formData.category].subCategories.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                  </select>
                  <i className="bi bi-chevron-down select-arrow"></i>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-upc-scan"></i>
                  Model Number
                </label>
                <input
                  className="form-input"
                  placeholder="Enter model number"
                  name="ProductModelNumber"
                  value={formData.ProductModelNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </motion.div>

          {/* AI Assistant Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="ai-assistant-card">
            <div className="ai-content">
              <div className="ai-icon-wrapper">
                <i className="bi bi-robot"></i>
                <div className="ai-pulse"></div>
              </div>
              <h3 className="ai-title">AI Assistant</h3>
              <p className="ai-description">Let our AI help you create compelling product descriptions and tags</p>
              <button
                type="button"
                className="ai-generate-btn"
                onClick={handleGenerateContent}
                disabled={loadingAI}
              >
                {loadingAI ? (
                  <>
                    <span className="spinner"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="bi bi-stars"></i>
                    Auto Generate Description & Tags
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Product Details Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="form-section-card">
            <div className="section-header">
              <div className="section-icon">
                <i className="bi bi-file-text-fill"></i>
              </div>
              <div>
                <h3 className="section-title">Product Details</h3>
                <p className="section-subtitle">Provide comprehensive information about your product</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group full-width">
                <label className="form-label">
                  <i className="bi bi-card-text"></i>
                  Product Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="5"
                  placeholder="Describe your product in detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                ></textarea>
                <span className="form-hint">Minimum 50 characters recommended</span>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <i className="bi bi-tags-fill"></i>
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  className="form-input"
                  placeholder="Enter tags separated by commas (e.g., cement, construction, building)"
                  value={formData.tags}
                  onChange={handleInputChange}
                />
                <span className="form-hint">Tags help customers find your product easily</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-speedometer2"></i>
                  Weight (kg)
                </label>
                <input
                  className="form-input"
                  placeholder="0.00"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-arrows-angle-expand"></i>
                  Dimensions (L×W×H cm)
                </label>
                <input
                  className="form-input"
                  placeholder="e.g., 20×15×10"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* Pricing & Inventory Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="form-section-card">
            <div className="section-header">
              <div className="section-icon pricing">
                <i className="bi bi-currency-rupee"></i>
              </div>
              <div>
                <h3 className="section-title">Pricing & Inventory</h3>
                <p className="section-subtitle">Set competitive prices and manage your stock</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-cash-stack"></i>
                  Original Price (₹) <span className="required">*</span>
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    name="price"
                    className="form-input with-prefix"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-percent"></i>
                  Discounted Price (₹)
                </label>
                <div className="input-with-prefix">
                  <span className="input-prefix">₹</span>
                  <input
                    type="number"
                    name="discountedprice"
                    className="form-input with-prefix"
                    placeholder="0.00"
                    value={formData.discountedprice}
                    onChange={handleInputChange}
                  />
                </div>
                <span className="form-hint">Leave empty if no discount</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-box-seam-fill"></i>
                  Stock Quantity <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  className="form-input"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-rulers"></i>
                  Unit of Measurement
                </label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                  >
                    <option>Piece</option>
                    <option>Kg</option>
                    <option>Liter</option>
                    <option>Bundle</option>
                    <option>Bag</option>
                    <option>Box</option>
                  </select>
                  <i className="bi bi-chevron-down select-arrow"></i>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-cart-plus-fill"></i>
                  Minimum Order Quantity
                </label>
                <input
                  className="form-input"
                  placeholder="1"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="bi bi-geo-alt-fill"></i>
                  Location/City <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="Enter your city"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* Product Images Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="form-section-card">
            <div className="section-header">
              <div className="section-icon images">
                <i className="bi bi-images"></i>
              </div>
              <div>
                <h3 className="section-title">Product Images</h3>
                <p className="section-subtitle">Upload high-quality images to showcase your product</p>
              </div>
            </div>

            <div
              className={`image-dropzone ${dragOver ? "dragover" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="dropzone-icon">
                <i className="bi bi-cloud-arrow-up-fill"></i>
              </div>
              <h4 className="dropzone-title">Click or Drag Images Here</h4>
              <p className="dropzone-text">Upload up to 10 images (JPG, PNG, WebP)</p>
              <span className="dropzone-hint">Maximum file size: 5MB per image</span>

              <input
                ref={fileInputRef}
                type="file"
                name="productImages"
                className="d-none"
                accept="image/*"
                multiple
                onChange={handleFileChange}
              />

              {previews.length > 0 && (
                <div className="image-previews">
                  {previews.map((src, i) => (
                    <div key={i} className="preview-item">
                      <img src={src} alt={`preview-${i}`} />
                    </div>
                  ))}
                </div>
              )}

              <button type="button" className="choose-files-btn">
                <i className="bi bi-folder2-open"></i>
                Choose Files
              </button>
            </div>
          </motion.div>

          {/* Review & Submit Section */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="form-section-card">
            <div className="section-header">
              <div className="section-icon submit">
                <i className="bi bi-check-circle-fill"></i>
              </div>
              <div>
                <h3 className="section-title">Review & Submit</h3>
                <p className="section-subtitle">Double-check your information before publishing</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="checklist-card">
              <h5 className="checklist-title">
                <i className="bi bi-list-check"></i>
                Product Listing Checklist
              </h5>
              <div className="checklist-grid">
                <div className={`checklist-item ${checklist.name ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.name ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Product name added</span>
                </div>
                <div className={`checklist-item ${checklist.category ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.category ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Category selected</span>
                </div>
                <div className={`checklist-item ${checklist.description ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.description ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Description provided</span>
                </div>
                <div className={`checklist-item ${checklist.price ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.price ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Price set</span>
                </div>
                <div className={`checklist-item ${checklist.images ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.images ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Images uploaded</span>
                </div>
                <div className={`checklist-item ${checklist.stock ? 'completed' : 'pending'}`}>
                  <i className={`bi ${checklist.stock ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                  <span>Stock quantity set</span>
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div className="agreement-wrapper">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  className="agreement-checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="checkbox-custom"></span>
                <span className="agreement-text">
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Product Guidelines</a>
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button type="button" className="btn-draft" onClick={saveDraft}>
                <i className="bi bi-floppy-fill"></i>
                Save as Draft
              </button>

              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload-fill"></i>
                    Submit Product
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Styles */}
      <style>{`
        /* =============================================
           Add Product Page - Yellow & White Theme
           ============================================= */
        
        .add-product-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #FFFBEB 0%, #FEF9C3 50%, #FFFFFF 100%);
        }

        .add-product-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Page Header */
        .page-header-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          text-align: center;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
          border: 1px solid #FDE68A;
        }

        .header-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.25rem;
          box-shadow: 0 8px 24px rgba(255, 214, 0, 0.35);
        }

        .header-icon i {
          font-size: 2rem;
          color: #1a1a1a;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 800;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 1.25rem;
        }

        .header-underline {
          width: 80px;
          height: 5px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 10px;
          margin: 0 auto;
        }

        /* Form Section Cards */
        .form-section-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
          border: 1px solid #f3f4f6;
        }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #f3f4f6;
        }

        .section-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .section-icon i {
          font-size: 1.25rem;
          color: #1a1a1a;
        }

        .section-icon.pricing {
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        }

        .section-icon.pricing i {
          color: #ffffff;
        }

        .section-icon.images {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }

        .section-icon.images i {
          color: #ffffff;
        }

        .section-icon.submit {
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
        }

        .section-icon.submit i {
          color: #ffffff;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.25rem;
        }

        .section-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        /* Form Grid */
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-label i {
          color: #D4A200;
          font-size: 0.9rem;
        }

        .required {
          color: #dc3545;
        }

        .form-input,
        .form-select,
        .form-textarea {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          color: #1a1a1a;
          background: #ffffff;
          transition: all 0.2s ease;
          width: 100%;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #FFD600;
          box-shadow: 0 0 0 4px rgba(255, 214, 0, 0.15);
        }

        .form-input::placeholder,
        .form-textarea::placeholder {
          color: #9ca3af;
        }

        .form-textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-hint {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        /* Select Wrapper */
        .select-wrapper {
          position: relative;
        }

        .form-select {
          appearance: none;
          padding-right: 2.5rem;
          cursor: pointer;
        }

        .select-arrow {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;
          font-size: 0.8rem;
        }

        /* Input with Prefix */
        .input-with-prefix {
          position: relative;
        }

        .input-prefix {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          font-weight: 600;
          color: #6b7280;
          font-size: 0.95rem;
        }

        .form-input.with-prefix {
          padding-left: 2.25rem;
        }

        /* AI Assistant Card */
        .ai-assistant-card {
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%);
          border-radius: 20px;
          padding: 2.5rem;
          margin-bottom: 1.5rem;
          border: 2px solid #FDE68A;
          text-align: center;
        }

        .ai-content {
          max-width: 480px;
          margin: 0 auto;
        }

        .ai-icon-wrapper {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.25rem;
        }

        .ai-icon-wrapper i {
          font-size: 2.5rem;
          color: #D4A200;
          position: relative;
          z-index: 1;
          line-height: 80px;
        }

        .ai-pulse {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
          opacity: 0.3;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.5; }
        }

        .ai-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .ai-description {
          font-size: 0.95rem;
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .ai-generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(255, 214, 0, 0.35);
        }

        .ai-generate-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 214, 0, 0.45);
        }

        .ai-generate-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .ai-generate-btn i {
          font-size: 1.125rem;
        }

        /* Image Dropzone */
        .image-dropzone {
          border: 2px dashed #FDE68A;
          background: linear-gradient(135deg, #FFFBEB 0%, #FEF9C3 50%);
          border-radius: 16px;
          padding: 2.5rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .image-dropzone:hover,
        .image-dropzone.dragover {
          border-color: #FFD600;
          background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
        }

        .dropzone-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          box-shadow: 0 4px 16px rgba(255, 214, 0, 0.3);
        }

        .dropzone-icon i {
          font-size: 2rem;
          color: #1a1a1a;
        }

        .dropzone-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .dropzone-text {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .dropzone-hint {
          font-size: 0.8rem;
          color: #9ca3af;
        }

        .image-previews {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          justify-content: center;
          margin: 1.5rem 0;
        }

        .preview-item {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #FDE68A;
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .choose-files-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: #ffffff;
          border: 2px solid #FFD600;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #1a1a1a;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.2s ease;
        }

        .choose-files-btn:hover {
          background: #FFD600;
        }

        /* Checklist */
        .checklist-card {
          background: #f9fafb;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .checklist-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .checklist-title i {
          color: #D4A200;
        }

        .checklist-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .checklist-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .checklist-item.completed {
          color: #16a34a;
        }

        .checklist-item.completed i {
          color: #22c55e;
        }

        .checklist-item.pending {
          color: #9ca3af;
        }

        .checklist-item.pending i {
          color: #dc3545;
        }

        /* Agreement */
        .agreement-wrapper {
          margin-bottom: 1.5rem;
        }

        .agreement-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }

        .agreement-checkbox {
          display: none;
        }

        .checkbox-custom {
          width: 22px;
          height: 22px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .agreement-checkbox:checked + .checkbox-custom {
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border-color: #FFD600;
        }

        .agreement-checkbox:checked + .checkbox-custom::after {
          content: "✓";
          color: #1a1a1a;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .agreement-text {
          font-size: 0.875rem;
          color: #4b5563;
        }

        .agreement-text a {
          color: #D4A200;
          font-weight: 600;
          text-decoration: none;
        }

        .agreement-text a:hover {
          text-decoration: underline;
        }

        /* Action Buttons */
        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-draft {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.75rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #4b5563;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-draft:hover {
          border-color: #FFD600;
          background: #FFFBEB;
        }

        .btn-submit {
          display: inline-flex;
          align-items: center;
          gap: 0.625rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFC107 100%);
          border: none;
          border-radius: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #1a1a1a;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(255, 214, 0, 0.35);
        }

        .btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(255, 214, 0, 0.45);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Spinner */
        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(26, 26, 26, 0.3);
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 768px) {
          .add-product-container {
            padding: 1rem;
          }

          .page-header-card {
            padding: 1.75rem 1.5rem;
          }

          .page-title {
            font-size: 1.5rem;
          }

          .form-section-card {
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .section-header {
            flex-direction: column;
            text-align: center;
          }

          .checklist-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn-draft,
          .btn-submit {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AddProductForm;
