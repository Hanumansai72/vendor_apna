import React, { useState } from "react";
import { Container, Form, Button, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Navbar from "../Navbar/navbar";
import axios from "axios";

const VendorCard = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const id = localStorage.getItem("vendorId");

  // handle input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id) {
      alert("Vendor ID not found. Please log in again.");
      return;
    }

    try {
      // prepare form data (important for file upload)
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("category", formData.category);
      data.append("vendorId", id);
      data.append("image", formData.image);

      // send to backend
      const res = await axios.post("https://backend-d6mx.vercel.app/projecteatils/vendor", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("✅ Project Uploaded Successfully!");
      console.log("Response:", res.data);

      // reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
      });
    } catch (error) {
      console.error("❌ Upload Error:", error);
      alert("Failed to upload project.");
    }
  };

  return (
    <>
      <Navbar />
      <Container className="py-5 d-flex justify-content-center">
        <Card className="p-4 shadow-lg w-100" style={{ maxWidth: "1200px" }}>
          <h4 className="mb-4 fw-bold">Upload Your Project</h4>

          <Form onSubmit={handleSubmit}>
            {/* Project Title */}
            <Form.Group className="mb-3">
              <Form.Label>Project Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your project title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Project Description */}
            <Form.Group className="mb-3">
              <Form.Label>Project Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Describe your project in detail (max 200 words)"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* Category */}
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Marketing">Marketing</option>
              </Form.Select>
            </Form.Group>

            {/* Upload Image */}
            <Form.Group className="mb-4">
              <Form.Label>Upload Images</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                name="image"
                onChange={handleChange}
                required
              />
              <Form.Text muted>
                Supported formats: JPG, PNG (Max 10MB)
              </Form.Text>
            </Form.Group>

            {/* Buttons */}
            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                type="reset"
                onClick={() =>
                  setFormData({ title: "", description: "", category: "", image: null })
                }
              >
                Cancel
              </Button>
              <Button
                type="submit"
                style={{ backgroundColor: "#FFD700", color: "#000", border: "none" }}
              >
                Upload Project
              </Button>
            </div>
          </Form>
        </Card>
      </Container>
    </>
  );
};

export default VendorCard;
