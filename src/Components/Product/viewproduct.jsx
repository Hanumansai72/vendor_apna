import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { motion, AnimatePresence } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const MyProducts = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("latest");
  const [range, setRange] = useState("Last 7 days");
  const [viewMode, setViewMode] = useState("grid");

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [count, setcount] = useState({});

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/vendor/${vendorId}/totalviews`)
      .then((res) => {
        setcount(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [vendorId]);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/viewproduct/${vendorId}`)
      .then((res) => {
        const mapped = (res.data || []).map((p) => ({
          id: p._id,
          name: p.ProductName,
          price: Number(p.ProductPrice) || 0,
          stock: Number(p.ProductStock) || 0,
          category: p.ProductCategory || "Uncategorized",
          subcategory: p.ProductSubCategory || "-",
          image: Array.isArray(p.ProductUrl) ? p.ProductUrl[0] : p.ProductUrl,
          status:
            Number(p.ProductStock) === 0
              ? "Out of Stock"
              : Number(p.ProductStock) < 10
                ? "Low Stock"
                : "Available",
          unitsSold: Math.floor(Math.random() * 1500) + 50,
          revenue: (Number(p.ProductPrice) || 0) * (Math.floor(Math.random() * 150) + 10),
        }));
        setProducts(mapped);
      })
      .catch((err) => console.error("fetch products error:", err))
      .finally(() => setLoading(false));
  }, [vendorId]);

  // filter/sort
  const filteredProducts = useMemo(() => {
    const list = products
      .filter((p) => {
        const t = searchTerm.toLowerCase();
        const match =
          p.name.toLowerCase().includes(t) ||
          p.category.toLowerCase().includes(t) ||
          p.subcategory.toLowerCase().includes(t);
        const cat = categoryFilter === "All" || p.category === categoryFilter;
        const stat = statusFilter === "All" || p.status === statusFilter;
        return match && cat && stat;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
      });
    return list;
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy]);

  const clearFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setSearchTerm("");
    setSortBy("latest");
  };

  // Delete product
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`${API_BASE_URL}/delete/${id}`)
        .then(() => {
          toast.success("Product deleted successfully!");
          setProducts((prev) => prev.filter((p) => p.id !== id));
        })
        .catch(() => toast.error("Failed to delete product."));
    }
  };

  // Edit modal
  const handleEditOpen = (product) => {
    setEditProduct({ ...product });
    setShowEdit(true);
  };

  const handleEditSave = () => {
    axios
      .put(`${API_BASE_URL}/updatedetails/${editProduct.id}`, {
        ProductName: editProduct.name,
        ProductPrice: editProduct.price,
        ProductStock: editProduct.stock,
        ProductDescription: "",
        ProductCategory: editProduct.category,
        ProductSubCategory: editProduct.subcategory,
      })
      .then(() => {
        toast.success("Product updated successfully!");
        setProducts((prev) =>
          prev.map((p) => (p.id === editProduct.id ? { ...p, ...editProduct } : p))
        );
        setShowEdit(false);
      })
      .catch(() => toast.error("Failed to update product."));
  };

  const getStatusStyle = (status) => {
    const styles = {
      "Available": { bg: "#d1fae5", color: "#047857", icon: "bi-check-circle-fill" },
      "Low Stock": { bg: "#fef3c7", color: "#d97706", icon: "bi-exclamation-triangle-fill" },
      "Out of Stock": { bg: "#fee2e2", color: "#dc2626", icon: "bi-x-circle-fill" },
    };
    return styles[status] || { bg: "#f3f4f6", color: "#6b7280", icon: "bi-question-circle" };
  };

  return (
    <>
      <div className="myproducts-page">
        <ProductNavbar />
        <ToastContainer position="top-right" autoClose={2500} />

        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="page-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header-content">
              <div className="header-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <div>
                <h1 className="page-title">My Products</h1>
                <p className="page-subtitle">Manage and view all your product listings</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="mini-stat">
                <span className="mini-stat-value">{products.length}</span>
                <span className="mini-stat-label">Total Products</span>
              </div>
              <div className="mini-stat">
                <span className="mini-stat-value">{products.filter(p => p.status === "Available").length}</span>
                <span className="mini-stat-label">In Stock</span>
              </div>
            </div>
          </motion.div>

          {/* Analytics Cards */}
          <motion.div
            className="analytics-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="analytics-header">
              <h4><i className="bi bi-graph-up"></i> Product Analytics</h4>
              <select
                className="range-select"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <div className="analytics-grid">
              {[
                { title: "Total Views", value: count.totalViews || 0, icon: "bi-eye", gradient: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)", change: "+12.5%" },
                { title: "Orders Placed", value: count.totalOrders || 0, icon: "bi-cart-check", gradient: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", change: "+24.5%" },
                { title: "Revenue Generated", value: `₹${(count.totalRevenue || 0).toLocaleString()}`, icon: "bi-currency-rupee", gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", change: "+31.8%" },
              ].map((stat, i) => (
                <motion.div
                  className="analytics-card"
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                >
                  <div className="analytics-icon" style={{ background: stat.gradient }}>
                    <i className={`bi ${stat.icon}`}></i>
                  </div>
                  <div className="analytics-info">
                    <span className="analytics-value">{stat.value}</span>
                    <span className="analytics-label">{stat.title}</span>
                  </div>
                  <span className="analytics-change positive">{stat.change}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            className="filters-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="search-wrapper">
              <i className="bi bi-search"></i>
              <input
                type="text"
                className="search-input"
                placeholder="Search products by name, category, or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="search-clear" onClick={() => setSearchTerm("")}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
            <div className="filter-controls">
              <select
                className="filter-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option>Construction Materials</option>
                <option>Tools & Equipment</option>
                <option>Electrical</option>
                <option>Paint & Finishing</option>
              </select>
              <select
                className="filter-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Status</option>
                <option>Available</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
              <select
                className="filter-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Sort by: Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <i className="bi bi-grid-3x3-gap"></i>
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <i className="bi bi-list-ul"></i>
                </button>
              </div>
              <button className="btn-export">
                <i className="bi bi-download"></i>
                Export
              </button>
            </div>
          </motion.div>

          {/* Active Filters */}
          {(categoryFilter !== "All" || statusFilter !== "All" || searchTerm) && (
            <motion.div
              className="active-filters"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <span className="filter-label">Active Filters:</span>
              {categoryFilter !== "All" && (
                <span className="filter-tag" onClick={() => setCategoryFilter("All")}>
                  {categoryFilter}
                  <i className="bi bi-x"></i>
                </span>
              )}
              {statusFilter !== "All" && (
                <span className="filter-tag" onClick={() => setStatusFilter("All")}>
                  {statusFilter}
                  <i className="bi bi-x"></i>
                </span>
              )}
              {searchTerm && (
                <span className="filter-tag" onClick={() => setSearchTerm("")}>
                  "{searchTerm}"
                  <i className="bi bi-x"></i>
                </span>
              )}
              <button className="clear-filters" onClick={clearFilters}>
                Clear All
              </button>
            </motion.div>
          )}

          {/* Products Grid */}
          <motion.div
            className="products-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {loading ? (
              <div className={`products-${viewMode}`}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div className="skeleton-card" key={i}></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="bi bi-box"></i>
                </div>
                <h3>No Products Found</h3>
                <p>Try adjusting your filters or add new products</p>
                <button className="btn-add-product" onClick={clearFilters}>
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={`products-${viewMode}`}>
                <AnimatePresence>
                  {filteredProducts.map((product, i) => (
                    <motion.div
                      className="product-card"
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="product-image-wrapper">
                        <img
                          src={product.image || "https://via.placeholder.com/300x200"}
                          alt={product.name}
                          className="product-image"
                        />
                        <span
                          className="product-status"
                          style={{
                            background: getStatusStyle(product.status).bg,
                            color: getStatusStyle(product.status).color
                          }}
                        >
                          <i className={`bi ${getStatusStyle(product.status).icon}`}></i>
                          {product.status}
                        </span>
                      </div>
                      <div className="product-content">
                        <span className="product-category">{product.category}</span>
                        <h4 className="product-name">{product.name}</h4>
                        <p className="product-subcategory">
                          <i className="bi bi-tag"></i>
                          {product.subcategory}
                        </p>
                        <div className="product-pricing">
                          <span className="product-price">₹{product.price.toLocaleString()}</span>
                          <span className="product-stock">
                            <i className="bi bi-archive"></i>
                            {product.stock} units
                          </span>
                        </div>
                        <div className="product-actions">
                          <button className="btn-edit" onClick={() => handleEditOpen(product)}>
                            <i className="bi bi-pencil"></i>
                            Edit
                          </button>
                          <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                            <i className="bi bi-trash3"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        </div>

        {/* Edit Modal */}
        {showEdit && (
          <div className="modal-overlay" onClick={() => setShowEdit(false)}>
            <motion.div
              className="edit-modal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3><i className="bi bi-pencil-square"></i> Edit Product</h3>
                <button className="modal-close" onClick={() => setShowEdit(false)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <div className="modal-body">
                {editProduct && (
                  <>
                    <div className="form-group">
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={editProduct.name}
                        onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Price (₹)</label>
                        <input
                          type="number"
                          value={editProduct.price}
                          onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Stock</label>
                        <input
                          type="number"
                          value={editProduct.stock}
                          onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Category</label>
                        <input
                          type="text"
                          value={editProduct.category}
                          onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Subcategory</label>
                        <input
                          type="text"
                          value={editProduct.subcategory}
                          onChange={(e) => setEditProduct({ ...editProduct, subcategory: e.target.value })}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowEdit(false)}>
                  Cancel
                </button>
                <button className="btn-save" onClick={handleEditSave}>
                  <i className="bi bi-check-lg"></i>
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          .myproducts-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 50%, #ffffff 100%);
            font-family: 'Inter', sans-serif;
          }

          /* Header */
          .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1.5rem;
            margin-bottom: 2rem;
            padding: 1.5rem 2rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .header-icon {
            width: 60px;
            height: 60px;
            background: rgba(255, 255, 255, 0.25);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.75rem;
            color: white;
            backdrop-filter: blur(10px);
          }

          .page-title {
            font-size: 1.875rem;
            font-weight: 700;
            color: white;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }

          .page-subtitle {
            color: rgba(255, 255, 255, 0.9);
            margin: 0.25rem 0 0;
            font-size: 0.95rem;
          }

          .header-stats {
            display: flex;
            gap: 1rem;
          }

          .mini-stat {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 0.875rem 1.5rem;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }

          .mini-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: white;
          }

          .mini-stat-label {
            font-size: 0.75rem;
            color: rgba(255, 255, 255, 0.85);
          }

          /* Analytics Section */
          .analytics-section {
            background: white;
            border-radius: 20px;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border: 1px solid #fef3c7;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          }

          .analytics-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.25rem;
          }

          .analytics-header h4 {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0;
          }

          .analytics-header h4 i {
            color: #f59e0b;
          }

          .range-select {
            padding: 0.5rem 1rem;
            border: 2px solid #fde68a;
            border-radius: 10px;
            background: #fffbeb;
            font-size: 0.875rem;
            font-weight: 500;
            color: #92400e;
            cursor: pointer;
          }

          .range-select:focus {
            outline: none;
            border-color: #fbbf24;
          }

          .analytics-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1.25rem;
          }

          @media (max-width: 768px) {
            .analytics-grid {
              grid-template-columns: 1fr;
            }
          }

          .analytics-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.25rem;
            background: linear-gradient(135deg, #fffbeb 0%, white 100%);
            border: 2px solid #fef3c7;
            border-radius: 16px;
            transition: all 0.3s ease;
          }

          .analytics-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 25px rgba(251, 191, 36, 0.15);
            border-color: #fbbf24;
          }

          .analytics-icon {
            width: 56px;
            height: 56px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            flex-shrink: 0;
          }

          .analytics-info {
            display: flex;
            flex-direction: column;
            flex: 1;
          }

          .analytics-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
          }

          .analytics-label {
            font-size: 0.85rem;
            color: #6b7280;
          }

          .analytics-change {
            padding: 0.375rem 0.75rem;
            border-radius: 8px;
            font-size: 0.8rem;
            font-weight: 600;
          }

          .analytics-change.positive {
            background: #d1fae5;
            color: #047857;
          }

          /* Filters Section */
          .filters-section {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
            margin-bottom: 1rem;
            padding: 1.25rem;
            background: white;
            border-radius: 16px;
            border: 1px solid #fef3c7;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          }

          .search-wrapper {
            position: relative;
            flex: 1;
            min-width: 280px;
          }

          .search-wrapper > i {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #9ca3af;
          }

          .search-input {
            width: 100%;
            padding: 0.75rem 2.5rem 0.75rem 2.75rem;
            border: 2px solid #fde68a;
            border-radius: 12px;
            font-size: 0.9rem;
            background: #fffbeb;
            transition: all 0.3s ease;
          }

          .search-input:focus {
            outline: none;
            border-color: #fbbf24;
            background: white;
            box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
          }

          .search-clear {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: #fbbf24;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            color: white;
          }

          .filter-controls {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            align-items: center;
          }

          .filter-select {
            padding: 0.75rem 1rem;
            border: 2px solid #fde68a;
            border-radius: 10px;
            background: white;
            font-size: 0.875rem;
            font-weight: 500;
            color: #374151;
            cursor: pointer;
            min-width: 150px;
          }

          .filter-select:focus {
            outline: none;
            border-color: #fbbf24;
          }

          .view-toggle {
            display: flex;
            background: #fef9c3;
            border-radius: 10px;
            padding: 0.25rem;
          }

          .view-btn {
            padding: 0.5rem 0.75rem;
            border: none;
            background: transparent;
            border-radius: 8px;
            color: #92400e;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .view-btn.active {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
          }

          .btn-export {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem 1.25rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-export:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.35);
          }

          /* Active Filters */
          .active-filters {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-wrap: wrap;
            margin-bottom: 1.5rem;
            padding: 0.875rem 1rem;
            background: #fffbeb;
            border-radius: 12px;
            border: 1px solid #fde68a;
          }

          .filter-label {
            font-weight: 600;
            color: #92400e;
          }

          .filter-tag {
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            background: white;
            border: 2px solid #fbbf24;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            color: #92400e;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .filter-tag:hover {
            background: #fee2e2;
            border-color: #dc2626;
            color: #dc2626;
          }

          .clear-filters {
            background: none;
            border: none;
            color: #f59e0b;
            font-weight: 600;
            cursor: pointer;
            margin-left: auto;
          }

          .clear-filters:hover {
            color: #d97706;
            text-decoration: underline;
          }

          /* Products Grid */
          .products-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
          }

          .products-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .products-list .product-card {
            flex-direction: row;
          }

          .products-list .product-image-wrapper {
            width: 200px;
            flex-shrink: 0;
          }

          .products-list .product-image {
            height: 150px;
          }

          @media (max-width: 1200px) {
            .products-grid {
              grid-template-columns: repeat(3, 1fr);
            }
          }

          @media (max-width: 992px) {
            .products-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 576px) {
            .products-grid {
              grid-template-columns: 1fr;
            }
          }

          .product-card {
            background: white;
            border-radius: 18px;
            border: 1px solid #fef3c7;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.04);
          }

          .product-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 12px 35px rgba(251, 191, 36, 0.2);
            border-color: #fbbf24;
          }

          .product-image-wrapper {
            position: relative;
            overflow: hidden;
          }

          .product-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .product-card:hover .product-image {
            transform: scale(1.05);
          }

          .product-status {
            position: absolute;
            top: 12px;
            right: 12px;
            display: inline-flex;
            align-items: center;
            gap: 0.375rem;
            padding: 0.375rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
          }

          .product-content {
            padding: 1.25rem;
          }

          .product-category {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 600;
            color: #f59e0b;
            background: #fef9c3;
            padding: 0.25rem 0.625rem;
            border-radius: 6px;
            margin-bottom: 0.5rem;
          }

          .product-name {
            font-size: 1rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 0.375rem;
            line-height: 1.3;
          }

          .product-subcategory {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.8rem;
            color: #6b7280;
            margin: 0 0 0.875rem;
          }

          .product-subcategory i {
            font-size: 0.7rem;
          }

          .product-pricing {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 2px dashed #fef3c7;
          }

          .product-price {
            font-size: 1.25rem;
            font-weight: 700;
            color: #047857;
          }

          .product-stock {
            display: flex;
            align-items: center;
            gap: 0.375rem;
            font-size: 0.85rem;
            color: #6b7280;
          }

          .product-actions {
            display: flex;
            gap: 0.75rem;
          }

          .btn-edit {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            padding: 0.625rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-edit:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
          }

          .btn-delete {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.375rem;
            padding: 0.625rem;
            background: white;
            border: 2px solid #fecaca;
            border-radius: 10px;
            color: #dc2626;
            font-weight: 600;
            font-size: 0.875rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-delete:hover {
            background: #fee2e2;
            border-color: #dc2626;
          }

          /* Empty State */
          .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: white;
            border-radius: 20px;
            border: 1px solid #fef3c7;
          }

          .empty-icon {
            width: 100px;
            height: 100px;
            background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          }

          .empty-icon i {
            font-size: 2.5rem;
            color: #d97706;
          }

          .empty-state h3 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1f2937;
            margin: 0 0 0.5rem;
          }

          .empty-state p {
            color: #6b7280;
            margin: 0 0 1.5rem;
          }

          .btn-add-product {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border: none;
            padding: 0.875rem 1.75rem;
            border-radius: 12px;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-add-product:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(251, 191, 36, 0.35);
          }

          /* Skeleton */
          .skeleton-card {
            height: 320px;
            background: linear-gradient(90deg, #fef9c3 25%, #fde68a 50%, #fef9c3 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 18px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }

          /* Modal */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
          }

          .edit-modal {
            background: white;
            border-radius: 20px;
            width: 100%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          }

          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1.5rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            color: white;
          }

          .modal-header h3 {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-weight: 700;
            margin: 0;
          }

          .modal-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 10px;
            padding: 0.5rem;
            color: white;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .modal-close:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          .modal-body {
            padding: 1.5rem;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          .form-group label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
          }

          .form-group input {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 2px solid #fde68a;
            border-radius: 10px;
            font-size: 0.95rem;
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            outline: none;
            border-color: #fbbf24;
            box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.15);
          }

          .form-row {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .modal-footer {
            display: flex;
            gap: 0.75rem;
            padding: 1.25rem 1.5rem;
            background: #fffbeb;
            border-top: 2px solid #fef3c7;
          }

          .btn-cancel {
            flex: 1;
            padding: 0.75rem;
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-weight: 600;
            color: #6b7280;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .btn-cancel:hover {
            background: #f3f4f6;
          }

          .btn-save {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            border: none;
            border-radius: 10px;
            font-weight: 700;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(251, 191, 36, 0.35);
          }

          /* Responsive */
          @media (max-width: 768px) {
            .page-header {
              flex-direction: column;
              text-align: center;
              padding: 1.25rem;
            }

            .header-content {
              flex-direction: column;
            }

            .header-stats {
              width: 100%;
              justify-content: center;
            }

            .filters-section {
              flex-direction: column;
            }

            .filter-controls {
              width: 100%;
              justify-content: center;
            }

            .filter-select {
              flex: 1;
              min-width: 0;
            }

            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
      <Footer />
    </>
  );
};

export default MyProducts;
