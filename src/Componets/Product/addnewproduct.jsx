// AddProductForm.jsx
import React, { useCallback, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductNavbar from "./productnav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";

// ====== Categories & Subcategories (UNCHANGED – backend compatibility) ======
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
  const vendorId = localStorage.getItem("vendorId");
  const navigate = useNavigate();

  // ====== Form state (UNCHANGED keys for backend) ======
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
  });

  // UI-only fields (not sent to backend – just for the nice form)
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

  // ====== Handlers ======
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Images – choose
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setFormData((prev) => ({ ...prev, productImages: files }));
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  // Images – drag/drop
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
      const res = await axios.post("https://backend-d6mx.vercel.app/generate-content", {
        category,
        subCategory,
      });

      const description = res?.data?.content?.des || "";
      const rawTags = res?.data?.content?.tag;
      const tags = Array.isArray(rawTags) ? rawTags.join(", ") : (rawTags || "");

      if (!description && !tags) {
        toast.info("No description or tags generated.");
      }

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
      // Upload images to Cloudinary (UNCHANGED)
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

      // Payload (UNCHANGED keys)
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
      };

      await axios.post("https://backend-d6mx.vercel.app/addproduct", productPayload);

      toast.success("Product submitted successfully!");
      // navigate("/product/dashboard"); // uncomment if you want to redirect
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveDraft = () => {
    // Frontend-only draft saving (localStorage)
    const draft = { ...formData, savedAt: Date.now() };
    localStorage.setItem("apnaMestri_product_draft", JSON.stringify(draft));
    toast.success("Draft saved locally!");
  };

  // ====== Motion helpers ======
  const fade = { initial: { opacity: 0, y: 14 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

  return (
    <div className="bg-soft">
      <ProductNavbar />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container py-4" style={{ maxWidth: 1040 }}>
        {/* ===== Header ===== */}
        <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4 text-center">
          <h2 className="fw-bold mb-1">Add New Product</h2>
          <p className="text-muted mb-2">
            Fill in the details to list your product on Apna Mestri marketplace.
          </p>
          <div className="underline mx-auto" />
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* ===== Basic Information ===== */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4">
            <h4 className="section-title">Basic Information</h4>
            <p className="text-muted">Enter the fundamental details of your product</p>

            <div className="row g-3 mt-2">
              <div className="col-12">
                <label className="form-label fw-semibold">Product Name *</label>
                <input
                  type="text"
                  name="productName"
                  className="form-control form-control-lg rounded-3"
                  placeholder="Enter product name"
                  value={formData.productName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Category *</label>
                <div className="input-with-caret">
                  <select
                    name="category"
                    className="form-select form-select-lg rounded-3"
                    value={formData.category}
                    onChange={(e) => {
                      // reset subcategory when category changes
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
                  <i className="bi bi-caret-down-fill" />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Subcategory *</label>
                <div className="input-with-caret">
                  <select
                    name="subCategory"
                    className="form-select form-select-lg rounded-3"
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
                  <i className="bi bi-caret-down-fill" />
                </div>
              </div>

              {/* Optional brand/model fields purely for UI parity */}
              <div className="col-md-6">
                <label className="form-label fw-semibold">Brand</label>
                <input
                  className="form-control rounded-3"
                  placeholder="Enter brand name"
                  onChange={() => {}}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Model Number</label>
                <input
                  className="form-control rounded-3"
                  placeholder="Enter model number"
                  onChange={() => {}}
                />
              </div>
            </div>
          </motion.div>

          {/* ===== AI Assistant ===== */}
          <motion.div
            {...fade}
            transition={{ duration: 0.35 }}
            className="ai-card p-4 p-md-5 mb-4 text-center"
          >
            <div className="ai-icon mb-2">
              <i className="bi bi-robot" />
            </div>
            <h4 className="fw-bold mb-1">AI Assistant</h4>
            <p className="text-muted mb-3">
              Let our AI help you create compelling product descriptions and tags
            </p>
            <button
              type="button"
              className="btn btn-outline-warning btn-lg rounded-4 fw-semibold"
              onClick={handleGenerateContent}
              disabled={loadingAI}
            >
              {loadingAI ? "Generating…" : "⚡ Auto Generate Description & Tags"}
            </button>
          </motion.div>

          {/* ===== Product Details ===== */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4">
            <h4 className="section-title">Product Details</h4>
            <p className="text-muted">Provide comprehensive information about your product</p>

            <div className="mt-2">
              <label className="form-label fw-semibold">Product Description *</label>
              <textarea
                name="description"
                className="form-control rounded-3"
                rows="5"
                placeholder="Describe your product in detail…"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              <small className="text-muted">Minimum 50 characters recommended</small>
            </div>

            <div className="mt-3">
              <label className="form-label fw-semibold">Tags</label>
              <input
                type="text"
                name="tags"
                className="form-control rounded-3"
                placeholder="Enter tags separated by commas (e.g., cement, construction, building)"
                value={formData.tags}
                onChange={handleInputChange}
              />
              <small className="text-muted">Tags help customers find your product easily</small>
            </div>

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Weight (kg)</label>
                <input
                  className="form-control rounded-3"
                  placeholder="0.00"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Dimensions (L×W×H cm)</label>
                <input
                  className="form-control rounded-3"
                  placeholder="e.g., 20×15×10"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-semibold">Material/Composition</label>
                <input
                  className="form-control rounded-3"
                  placeholder="e.g., Steel, Concrete, Plastic"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                />
              </div>
            </div>
          </motion.div>

          {/* ===== Pricing & Inventory ===== */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4">
            <h4 className="section-title">Pricing & Inventory</h4>
            <p className="text-muted">Set competitive prices and manage your stock</p>

            <div className="row g-3 mt-1">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Original Price (₹) *</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    name="price"
                    className="form-control rounded-end-3"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Discounted Price (₹)</label>
                <div className="input-group">
                  <span className="input-group-text">₹</span>
                  <input
                    type="number"
                    name="discountedprice"
                    className="form-control rounded-end-3"
                    placeholder="0.00"
                    value={formData.discountedprice}
                    onChange={handleInputChange}
                  />
                </div>
                <small className="text-muted">Leave empty if no discount</small>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  className="form-control rounded-3"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Unit of Measurement</label>
                <div className="input-with-caret">
                  <select
                    className="form-select rounded-3"
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
                  <i className="bi bi-caret-down-fill" />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Minimum Order Quantity</label>
                <input
                  className="form-control rounded-3"
                  placeholder="1"
                  value={moq}
                  onChange={(e) => setMoq(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Location/City *</label>
                <input
                  type="text"
                  name="location"
                  className="form-control rounded-3"
                  placeholder="Enter your city"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </motion.div>

          {/* ===== Product Images ===== */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4">
            <h4 className="section-title">Product Images</h4>
            <p className="text-muted">Upload high-quality images to showcase your product</p>

            <div
              className={`dropzone ${dragOver ? "dragover" : ""}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-icon">
                <i className="bi bi-cloud-upload-fill" />
              </div>
              <h5 className="mb-1">Click or Drag Images Here</h5>
              <p className="text-muted mb-2">Upload up to 10 images (JPG, PNG, WebP)</p>
              <small className="text-muted">Maximum file size: 5MB per image</small>

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
                <div className="thumbs mt-3">
                  {previews.map((src, i) => (
                    <img key={i} src={src} alt={`p${i}`} className="thumb" />
                  ))}
                </div>
              )}
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-warning text-dark fw-semibold rounded-4 px-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Files
                </button>
              </div>
            </div>
          </motion.div>

          {/* ===== Review & Submit ===== */}
          <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-5">
            <h4 className="section-title">Review & Submit</h4>
            <p className="text-muted">Double-check your information before publishing</p>

            <div className="checklist p-3 rounded-3 mb-3">
              <h6 className="fw-bold mb-2">Product Listing Checklist</h6>
              <div className="row small">
                <div className="col-md-6">{
                  checklist.name ? "✔️ Product name added" : "❌ Product name missing"
                }</div>
                <div className="col-md-6">{
                  checklist.category ? "✔️ Category selected" : "❌ Category missing"
                }</div>
                <div className="col-md-6">{
                  checklist.description ? "✔️ Description provided" : "❌ Description missing"
                }</div>
                <div className="col-md-6">{
                  checklist.price ? "✔️ Price set" : "❌ Price missing"
                }</div>
                <div className="col-md-6">{
                  checklist.images ? "✔️ Images uploaded" : "❌ Images not uploaded"
                }</div>
                <div className="col-md-6">{
                  checklist.stock ? "✔️ Stock quantity set" : "❌ Stock missing"
                }</div>
              </div>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="agree"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="agree">
                I agree to the Terms of Service and Product Guidelines
              </label>
            </div>

            <div className="d-flex flex-wrap gap-3">
              <button
                type="button"
                className="btn btn-light rounded-4 px-4"
                onClick={saveDraft}
              >
                <i className="bi bi-floppy-fill me-2" />
                Save as Draft
              </button>

              <button
                type="submit"
                className="btn btn-warning text-dark rounded-4 px-4 fw-semibold"
                disabled={submitting}
              >
                {submitting ? "Submitting…" : (<><i className="bi bi-cloud-upload-fill me-2" /> Submit Product</>)}
              </button>
            </div>
          </motion.div>
        </form>
      </div>

      {/* Inline styles to match the previewed yellow/white theme */}
      <style>{`
        :root {
          --soft-bg: #fbfcff;
          --card: #ffffff;
          --border: #eef0f3;
          --yellow: #FFD200;
          --yellow-600: #ffc107;
          --text: #222;
        }
        .bg-soft { background: var(--soft-bg); min-height: 100vh; }
        .card-soft {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 8px 30px rgba(0,0,0,.04);
        }
        .section-title {
          font-weight: 800;
          margin-bottom: 4px;
        }
        .underline {
          width: 120px; height: 6px; border-radius: 10px;
          background: var(--yellow);
        }
        .input-with-caret { position: relative; }
        .input-with-caret > i {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          color: #c2c6cc; pointer-events: none;
        }

        /* AI card */
        .ai-card {
          background: #fff8dc;
          border: 1px solid #ffe7a1;
          border-radius: 18px;
        }
        .ai-icon {
          width: 64px; height: 64px; line-height: 64px;
          border-radius: 999px; margin: 0 auto;
          background: #ffefb3; color: #b07b00; font-size: 28px;
        }

        /* Dropzone */
        .dropzone {
          border: 2px dashed #ffd86b;
          background: #fff9e9;
          border-radius: 18px;
          text-align: center;
          padding: 28px;
          transition: .2s;
          cursor: pointer;
        }
        .dropzone.dragover { background: #fff4cf; border-color: #ffcd45; }
        .upload-icon {
          width: 72px; height: 72px; border-radius: 999px;
          background: #ffde80; color: #a86f00; display: inline-flex;
          align-items: center; justify-content: center; font-size: 32px; margin-bottom: 10px;
        }
        .thumbs { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .thumb {
          width: 90px; height: 90px; object-fit: cover; border-radius: 12px;
          border: 1px solid #f1e6bf;
        }

        .checklist {
          background: #eafaf0;
          border: 1px solid #bfe6cd;
        }
      `}</style>
    </div>
  );
};

export default AddProductForm;
