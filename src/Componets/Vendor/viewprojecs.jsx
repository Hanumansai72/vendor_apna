import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";
import API_BASE_URL from "../../config";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";

const VendorProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/projects/${vendorId}`);
      setProjects(res.data);
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      alert("✅ Project deleted successfully!");
    } catch (error) {
      console.error("❌ Delete error:", error);
      alert("Failed to delete project.");
    }
  };

  useEffect(() => {
    if (vendorId) fetchProjects();
  }, [vendorId]);

  return (
    <>
      <Navbar />
      <Container className="py-5">
        <h3 className="fw-bold mb-4">Your Projects</h3>

        {loading ? (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        ) : projects.length === 0 ? (
          <p>No projects uploaded yet.</p>
        ) : (
          <Row>
            {projects.map((project) => (
              <Col key={project._id} md={4} className="mb-4">
                <Card className="shadow-sm h-100">
                  {project.image && (
                    <Card.Img
                      variant="top"
                      src={project.image}
                      alt={project.title}
                      style={{ height: "200px", objectFit: "cover" }}
                    />
                  )}
                  <Card.Body>
                    <Card.Title>{project.title}</Card.Title>
                    <Card.Text>{project.description}</Card.Text>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
      <Footer></Footer>
    </>
  );
};

export default VendorProjects;
