import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Form,
  Row,
  Col,
  Badge,
  Modal,
} from "react-bootstrap";
import { FaEdit } from "react-icons/fa";
import Navbar from "./navbar";
import { BiPlus } from "react-icons/bi";
import { Link } from "react-router-dom";

const id = localStorage.getItem("vendorId");

// Static category and subcategory mapping
const categoryMap = {
  Cement: ["UltraTech", "ACC", "Ambuja", "Dalmia", "Ramco"],
  Steel: ["TATA Tiscon", "JSW Steel", "Jindal Panther", "SAIL"],
  Plumbing: ["Ashirvad", "Astral", "Prince", "Supreme"],
  Electrical: ["Havells", "Finolex", "Polycab", "RR Kabel"],
  Paints: ["Asian Paints", "Berger", "Nerolac", "Indigo"],
  Bricks: ["Wienerberger", "Porotherm", "Jindal Bricks"],
  Sand: ["Robo Sand", "River Sand", "M-Sand"],
  Aggregates: ["20mm Aggregate", "40mm Aggregate", "10mm Aggregate"],
  Concrete: ["RMC India", "Ultratech RMC", "ACC Ready Mix"],
  Tiles: ["Kajaria", "Somany", "Nitco", "Johnson"],
  Glass: ["Saint-Gobain", "AIS Glass", "Modiguard"],
  Doors: ["Greenply", "CenturyPly", "Kitply", "Fenesta"],
  Windows: ["Fenesta", "UPVC India", "Windoor"],
  Roofing: ["Tata Shaktee", "Everest", "JSW Colouron+"],
  GroutsSealants: ["Dr. Fixit", "MYK LATICRETE", "Roff"],
  Lighting: ["Philips", "Syska", "Wipro", "Halonix"],
  Kitchen: ["Hettich", "Häfele", "Godrej Interio"],
  Wardrobe: ["Godrej", "Durian", "Urban Ladder"],
  Wallpaper: ["Nilaya", "Excel", "Marburg"],
  Curtains: ["D'Decor", "Fabindia", "Spaces"],
  Furniture: ["IKEA", "Urban Ladder", "Pepperfry"],
  BathroomFittings: ["Jaquar", "Kohler", "Hindware"],
  FalseCeiling: ["Gyproc", "Armstrong", "USG Boral"],
  Flooring: ["Pergo", "Greenlam", "Squarefoot"],
  ModularFurniture: ["Godrej Interio", "Featherlite", "Zuari"],
  DecorativePanels: ["Merino", "Greenlam", "Century Laminates"],
  SmartHome: ["Schneider", "Anchor", "Legrand"],
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [priceSort, setPriceSort] = useState("default");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  useEffect(() => {
    axios
      .get(`https://backend-d6mx.vercel.app/viewproduct/${id}`)
      .then((res) => {
        const mappedProducts = res.data.map((product) => ({
          id: product._id,
          name: product.ProductName,
          price: parseFloat(product.ProductPrice),
          stock: parseInt(product.ProductStock),
          category: product.ProductCategory,
          subcategory: product.ProductSubCategory,
          description: product.ProductDescripition,
          ProductUrl: product.ProductUrl,
          availability: true,
          status:
            parseInt(product.ProductStock) === 0
              ? "Out of Stock"
              : parseInt(product.ProductStock) < 10
              ? "Low Stock"
              : "Available",
        }));
        setProducts(mappedProducts);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  const handleEditClick = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleDelete = (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`https://backend-d6mx.vercel.app/delete/${productId}`)
        .then(() => {
          setProducts((prev) => prev.filter((p) => p.id !== productId));
        })
        .catch((err) => {
          console.error("Error deleting product:", err);
          alert("Failed to delete product.");
        });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = () => {
    axios
      .put(
        `https://backend-d6mx.vercel.app/updatedetails/${editProduct.id}`,
        {
          ProductName: editProduct.name,
          ProductPrice: editProduct.price,
          ProductStock: editProduct.stock,
          ProductDescription: editProduct.description,
          ProductCategory: editProduct.category,
          ProductSubCategory: editProduct.subcategory,
          ProductTags: "",
          ProductLocation: "",
        }
      )
      .then(() => {
        setProducts((prev) =>
          prev.map((p) => (p.id === editProduct.id ? { ...editProduct } : p))
        );
        setShowModal(false);
        setEditProduct(null);
      })
      .catch((err) => {
        console.error("Error updating product:", err);
        alert("Failed to update product.");
      });
  };

  const filteredProducts = products
    .filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      return nameMatch && categoryMatch;
    })
    .sort((a, b) => {
      if (priceSort === "lowToHigh") return a.price - b.price;
      if (priceSort === "highToLow") return b.price - a.price;
      return 0;
    });

  return (
    <div>
      <Navbar
        homeLabel="Home"
        homeUrl={`/Product/${id}`}
        jobsLabel="Products"
        jobsUrl={`/product/${id}/ViewProduct`}
        historyLabel="New Orders"
        historyUrl={`/product/${id}/order`}
        earningsLabel="Order History"
        earningsUrl={`/product/${id}/order/history`}
      />

      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3>Your Products</h3>
            <p className="mb-0">Manage and update your product listings.</p>
          </div>
          <Link to={`/addproduct/${id}`} style={{ textDecoration: "none" }}>
            <Button variant="success" className="d-flex align-items-center">
              <BiPlus size={20} className="me-1" />
              Add Product
            </Button>
          </Link>
        </div>

        <Row className="mb-4">
          <Col md={4}>
            <Form.Control
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md={4}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">Category: All</option>
              {Object.keys(categoryMap).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col md={4}>
            <Form.Select
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
            >
              <option value="default">Sort by: Default</option>
              <option value="lowToHigh">Price: Low to High</option>
              <option value="highToLow">Price: High to Low</option>
            </Form.Select>
          </Col>
        </Row>

        <Row>
          {filteredProducts.map((product) => (
            <Col md={4} className="mb-4" key={product.id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={product.ProductUrl}
                  alt={product.name}
                />
                <Card.Body>
                  <Card.Title>{product.name}</Card.Title>
                  <h6>₹ {product.price}</h6>
                  <p className="text-muted">
                    {product.category} · {product.subcategory}
                  </p>
                  <p className="mb-1">
                    <strong>Stock:</strong> {product.stock}
                  </p>
                  <Badge
                    bg={
                      product.status === "Available"
                        ? "success"
                        : product.status === "Low Stock"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {product.status}
                  </Badge>
                </Card.Body>
                <Card.Footer className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleEditClick(product)}
                  >
                    <FaEdit /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Edit Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Product</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {editProduct && (
              <Form>
                {["name", "price", "stock", "description", "category", "subcategory"].map(
                  (field) => (
                    <Form.Group key={field} className="mb-2">
                      <Form.Label>{field.charAt(0).toUpperCase() + field.slice(1)}</Form.Label>
                      <Form.Control
                        name={field}
                        value={editProduct[field]}
                        onChange={handleInputChange}
                        type={["price", "stock"].includes(field) ? "number" : "text"}
                      />
                    </Form.Group>
                  )
                )}
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default ProductList;
