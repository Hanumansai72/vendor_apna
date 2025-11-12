import React, { useCallback, useMemo, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ProductNavbar from "./productnav";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const vendorId = localStorage.getItem("vendorId");
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
    ProductModelNumber: "", // ✅ Added new field
    isAvailable: true, // ✅ Added new field
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
      const res = await axios.post("https://backend-d6mx.vercel.app/generate-content", {
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

      await axios.post("https://backend-d6mx.vercel.app/addproduct", productPayload);
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
    <div className="bg-soft">
      <ProductNavbar />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container py-4" style={{ maxWidth: 1040 }}>
        <motion.div {...fade} transition={{ duration: 0.35 }} className="card-soft p-4 mb-4 text-center">
          <h2 className="fw-bold mb-1">Add New Product</h2>
          <p className="text-muted mb-2">Fill in the details to list your product on Apna Mestri marketplace.</p>
          <div className="underline mx-auto" />
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
