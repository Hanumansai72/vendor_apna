import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { Button, Form, Badge, Modal } from "react-bootstrap";
import { BiFilter, BiDownload } from "react-icons/bi";
import { FaEdit, FaTrash } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductNavbar from "./productnav";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";

const MyProducts = () => {
  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Sort by: Latest");
  const [range, setRange] = useState("Last 7 days");

  // edit modal
  const [showEdit, setShowEdit] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [count, setcount] = useState("");

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
        if (sortBy === "Price: Low to High") return a.price - b.price;
        if (sortBy === "Price: High to Low") return b.price - a.price;
        return 0;
      });
    return list;
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy]);

  const clearFilters = () => {
    setCategoryFilter("All");
    setStatusFilter("All");
    setSearchTerm("");
    setSortBy("Sort by: Latest");
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

  // Analytics + Top Selling + Category Perf


  const categoryPerf = useMemo(() => {
    const totals = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.revenue;
      return acc;
    }, {});
    const total = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals)
      .map(([label, val]) => ({
        label,
        pct: Math.round((val / total) * 100),
        money: `₹${(val / 100000).toFixed(2)}L`,
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);
  }, [products]);

  return (
    <>
      <div className="myproducts-page">
        <ProductNavbar />
        <ToastContainer position="top-right" autoClose={2500} />

        {/* Filters */}
        <div className="container mt-4 mb-3">
          <div className="filter-bar p-3 rounded-3 shadow-sm bg-white d-flex flex-wrap align-items-center gap-2">
            <Form.Control
              type="text"
              placeholder="🔍 Search products by name, category, or SKU..."
              className="flex-grow-1"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Form.Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All</option>
              <option>Construction Materials</option>
              <option>Tools & Equipment</option>
              <option>Electrical</option>
              <option>Paint & Finishing</option>
            </Form.Select>
            <Form.Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              <option>Available</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </Form.Select>
            <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>Sort by: Latest</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </Form.Select>
            <Button variant="outline-secondary"><BiFilter size={18} /></Button>
            <Button variant="outline-secondary"><BiDownload size={18} /></Button>
          </div>

          {(categoryFilter !== "All" || statusFilter !== "All" || searchTerm) && (
            <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
              <span className="fw-semibold">Active Filters:</span>
              {categoryFilter !== "All" && (
                <span className="badge bg-warning-subtle text-dark px-3 py-2">
                  {categoryFilter} ✕
                </span>
              )}
              {statusFilter !== "All" && (
                <span className="badge bg-success-subtle text-dark px-3 py-2">
                  {statusFilter} ✕
                </span>
              )}
              {searchTerm && (
                <span className="badge bg-secondary-subtle text-dark px-3 py-2">
                  “{searchTerm}” ✕
                </span>
              )}
              <span
                onClick={clearFilters}
                className="text-warning fw-semibold ms-1"
                style={{ cursor: "pointer" }}
              >
                Clear All
              </span>
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="container mb-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h4 className="fw-bold mb-0">Product Analytics</h4>
            <Form.Select value={range} onChange={(e) => setRange(e.target.value)} style={{ width: 160 }}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </Form.Select>
          </div>
          <div className="row g-3">
            {[
              { title: "Total Views", value: count.totalViews || 0, sub: "Across all products", color: "#e8f0ff" },
              { title: "Orders Placed", value: count.totalOrders || 0, sub: "This month", color: "#eaffea", growth: "+24.5%" },
              { title: "Revenue Generated", value: count.totalRevenue || 0, sub: "From products", color: "#fff5d1", growth: "+31.8%" },
            ].map((c, i) => (
              <div className="col-md-4" key={i}>
                <div className="p-4 rounded-4 shadow-sm h-100" style={{ background: c.color }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="fw-semibold">{c.title}</h6>
                      <h2 className="fw-bold mt-2">{c.value}</h2>
                      <p className="text-muted small mb-0">{c.sub}</p>
                    </div>
                    <Badge bg="light" className="text-dark fw-semibold">{c.growth}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="container mb-5">
          {loading ? (
            <div className="row g-4">
              {[1, 2, 3, 4].map((i) => (
                <div className="col-md-3" key={i}>
                  <div className="skeleton skeleton-card"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted py-5">No products found.</div>
          ) : (
            <div className="row g-4">
              {filteredProducts.map((p) => (
                <div className="col-md-3" key={p.id}>
                  <div className="product-card rounded-4 shadow-sm bg-white">
                    <div className="position-relative">
                      <img src={p.image || "https://via.placeholder.com/600x400"} alt={p.name} className="product-img rounded-top-4" />
                      <span
                        className={`badge position-absolute top-2 end-2 ${p.status === "Available"
                          ? "bg-success"
                          : p.status === "Low Stock"
                            ? "bg-warning"
                            : "bg-danger"
                          }`}
                        style={{ borderRadius: 12, padding: "6px 12px" }}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-muted mb-0 small">{p.category}</p>
                      <h6 className="fw-bold">{p.name}</h6>
                      <p className="text-muted small mb-2">Subcategory: {p.subcategory}</p>
                      <h5 className="fw-bold mb-1">₹{p.price}</h5>
                      <div className="text-success small mb-3">
                        {p.status === "Available" ? "In Stock" : p.status} • {p.stock} units
                      </div>
                      <div className="d-flex justify-content-between">
                        <Button variant="warning" className="w-50 me-2" onClick={() => handleEditOpen(p)}>
                          <FaEdit className="me-1" /> Edit
                        </Button>
                        <Button variant="outline-danger" className="w-50" onClick={() => handleDelete(p.id)}>
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>



        {/* Edit Modal */}
        <Modal show={showEdit} onHide={() => setShowEdit(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editProduct && (
              <Form>
                {["name", "price", "stock", "category", "subcategory"].map((field) => (
                  <Form.Group key={field} className="mb-3">
                    <Form.Label className="text-capitalize">{field}</Form.Label>
                    <Form.Control
                      type={["price", "stock"].includes(field) ? "number" : "text"}
                      value={editProduct[field]}
                      onChange={(e) =>
                        setEditProduct({ ...editProduct, [field]: e.target.value })
                      }
                    />
                  </Form.Group>
                ))}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleEditSave}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        <style>{`
        .product-img { width: 100%; height: 190px; object-fit: cover; }
        .skeleton {
          background: linear-gradient(90deg,#f2f2f2 25%,#e8e8e8 37%,#f2f2f2 63%);
          background-size: 400% 100%;
          animation: shimmer 1.6s infinite;
          border-radius: 16px;
        }
        .skeleton-card { height: 340px; }
        @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
      `}</style>
      </div>
      <Footer></Footer>
    </>
  );
};

export default MyProducts;
