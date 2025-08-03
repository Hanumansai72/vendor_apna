import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "./navbar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    subCategory: "",
    price: "",
    stock: "",
    location: "",
    tags: "",
    description: "",
    productImages: [],
  });

  const [loadingAI, setLoadingAI] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, productImages: Array.from(e.target.files) }));
  };

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
      console.log(res.data)

      let description = res.data?.content.des || "";
      const rawTags = res.data?.content.tag;
      const tags = Array.isArray(rawTags) ? rawTags.join(", ") : (rawTags || "");

      if (!description && !tags) {
        toast.info("No description or tags generated.");
      }

      setFormData((prev) => ({
        ...prev,
        description: description || prev.description,
        tags: tags || prev.tags,
      }));
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to auto-generate description and tags.");
    }
    setLoadingAI(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let imageUrls = [];

      for (const image of formData.productImages) {
        const cloudinaryData = new FormData();
        cloudinaryData.append("file", image);
        cloudinaryData.append("upload_preset", "myupload");
        cloudinaryData.append("cloud_name", "dqxsgmf33");

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dqxsgmf33/image/upload",
          cloudinaryData
        );
        imageUrls.push(cloudinaryRes?.data?.secure_url);
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
        ProductUrl: imageUrls, // now array of images
      };

      await axios.post("https://backend-d6mx.vercel.app/addproduct", productPayload);
      toast.success("Product submitted successfully!");
      console.log(productPayload)
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Failed to submit product.");
    }
  };

  return (
    <div>
      <Navbar
        homeLabel="Home"
        homeUrl={`/Product/${vendorId}`}
        jobsLabel="Products"
        jobsUrl={`/product/${vendorId}/ViewProduct`}
        historyLabel="New Orders"
        historyUrl={`/product/${vendorId}/order`}
        earningsLabel="Order History"
        earningsUrl={`/product/${vendorId}/order/history`}
      />

      <ToastContainer position="top-right" autoClose={3000} />

      <div className="container mt-5">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              className="form-control"
              value={formData.productName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label>Category</label>
              <select
                name="category"
                className="form-select"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {Object.keys(categoryBrands).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label>Sub-Category</label>
              <select
                name="subCategory"
                className="form-select"
                value={formData.subCategory}
                onChange={handleInputChange}
                disabled={!formData.category}
                required
              >
                <option value="">Select Sub-Category</option>
                {formData.category &&
                  categoryBrands[formData.category].subCategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-info mb-3"
            onClick={handleGenerateContent}
            disabled={loadingAI}
          >
            {loadingAI ? "Generating Description & Tags..." : "Auto-Generate Description & Tags"}
          </button>

          <div className="mb-3">
            <label>Description</label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              required
            />
          </div>

          <div className="mb-3">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              className="form-control"
              value={formData.tags}
              onChange={handleInputChange}
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <label>Price</label>
              <input
                type="number"
                name="price"
                className="form-control"
                value={formData.price}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label>Stock</label>
              <input
                type="number"
                name="stock"
                className="form-control"
                value={formData.stock}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="col-md-4">
              <label>Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label>Product Images (multiple allowed)</label>
            <input
              type="file"
              name="productImages"
              className="form-control"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Submit Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
