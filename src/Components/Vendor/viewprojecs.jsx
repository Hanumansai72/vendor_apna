import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../../config";
import Navbar from "../Navbar/navbar";
import Footer from "../Navbar/footer";
import { useAuth } from "../Auth/AuthContext";
import "./Techincal.css";

const VendorProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const { user: authUser } = useAuth();
  const vendorId = authUser?.id;

  const fetchProjects = useCallback(async () => {
    if (!vendorId) return;
    try {
      const res = await api.get(`/api/projects/${vendorId}`);
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [vendorId]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete project.");
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <>
      <Navbar />
      <div className="projects-wrapper">
        <div className="container-xl py-4">
          {/* Header */}
          <motion.div
            className="projects-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="header-content">
              <h1 className="page-title">
                <i className="bi bi-folder-fill text-warning me-3"></i>
                My Projects
              </h1>
              <p className="page-subtitle">
                Showcase your completed work to attract more customers
              </p>
            </div>
            <Link to={`/vendor/projectupload/${vendorId}`} className="btn-upload">
              <i className="bi bi-plus-lg me-2"></i>
              Upload Project
            </Link>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            className="projects-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-item">
              <span className="stat-number">{projects.length}</span>
              <span className="stat-label">Total Projects</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                {projects.filter(p => p.featured).length || 0}
              </span>
              <span className="stat-label">Featured</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">
                {projects.reduce((sum, p) => sum + (p.views || 0), 0)}
              </span>
              <span className="stat-label">Total Views</span>
            </div>
          </motion.div>

          {/* Projects Grid */}
          {loading ? (
            <div className="loading-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div className="project-skeleton" key={i}>
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <motion.div
              className="empty-state-projects"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="empty-icon">
                <i className="bi bi-images"></i>
              </div>
              <h4>No Projects Yet</h4>
              <p>Upload your first project to showcase your work and attract more customers.</p>
              <Link to={`/vendor/projectupload/${vendorId}`} className="btn-upload-empty">
                <i className="bi bi-cloud-arrow-up me-2"></i>
                Upload Your First Project
              </Link>
            </motion.div>
          ) : (
            <motion.div
              className="projects-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <AnimatePresence>
                {projects.map((project, index) => (
                  <motion.div
                    className="project-card"
                    key={project._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="project-image-wrapper">
                      {project.image ? (
                        <img
                          src={project.image}
                          alt={project.title}
                          className="project-image"
                        />
                      ) : (
                        <div className="project-placeholder">
                          <i className="bi bi-image"></i>
                        </div>
                      )}
                      <div className="project-overlay">
                        <button
                          className="btn-project-action view"
                          onClick={() => window.open(project.image, '_blank')}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <button
                          className="btn-project-action delete"
                          onClick={() => setDeleteId(project._id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      {project.featured && (
                        <span className="featured-badge">
                          <i className="bi bi-star-fill"></i> Featured
                        </span>
                      )}
                    </div>
                    <div className="project-content">
                      <h5 className="project-title">{project.title}</h5>
                      <p className="project-description">
                        {project.description?.substring(0, 80) || "No description"}
                        {project.description?.length > 80 && "..."}
                      </p>
                      <div className="project-footer">
                        <span className="project-date">
                          <i className="bi bi-calendar3 me-1"></i>
                          {new Date(project.createdAt || Date.now()).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {project.views && (
                          <span className="project-views">
                            <i className="bi bi-eye me-1"></i>
                            {project.views}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-icon delete">
                <i className="bi bi-trash"></i>
              </div>
              <h4>Delete Project?</h4>
              <p>This action cannot be undone. The project will be permanently removed.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="btn-delete" onClick={() => handleDelete(deleteId)}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />

      <style>{`
        .projects-wrapper {
          min-height: 100vh;
          background: var(--bg-light, #f9fafb);
        }
        
        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .header-content {
          flex: 1;
        }
        
        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--text-primary, #111827);
          display: flex;
          align-items: center;
          margin-bottom: 0.25rem;
        }
        
        .page-subtitle {
          color: var(--text-muted, #9ca3af);
          font-size: 0.95rem;
          margin: 0;
        }
        
        .btn-upload {
          display: inline-flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border: none;
          border-radius: 12px;
          color: #111827;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(255, 214, 0, 0.3);
        }
        
        .btn-upload:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(255, 214, 0, 0.4);
          color: #111827;
        }
        
        /* Stats Bar */
        .projects-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          padding: 1.25rem 2rem;
          margin-bottom: 2rem;
        }
        
        .stat-item {
          text-align: center;
        }
        
        .stat-number {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary, #111827);
        }
        
        .stat-label {
          font-size: 0.8rem;
          color: var(--text-muted, #9ca3af);
        }
        
        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--border, #e5e7eb);
        }
        
        /* Projects Grid */
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .project-card {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #FFD600;
        }
        
        .project-image-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        
        .project-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        
        .project-card:hover .project-image {
          transform: scale(1.05);
        }
        
        .project-placeholder {
          width: 100%;
          height: 100%;
          background: var(--bg-subtle, #f3f4f6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--text-muted, #9ca3af);
        }
        
        .project-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .project-card:hover .project-overlay {
          opacity: 1;
        }
        
        .btn-project-action {
          width: 44px;
          height: 44px;
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-project-action.view {
          background: white;
          color: #111827;
        }
        
        .btn-project-action.delete {
          background: #ef4444;
          color: white;
        }
        
        .btn-project-action:hover {
          transform: scale(1.1);
        }
        
        .featured-badge {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          padding: 0.375rem 0.75rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }
        
        .project-content {
          padding: 1.25rem;
        }
        
        .project-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary, #111827);
          margin: 0 0 0.5rem;
        }
        
        .project-description {
          font-size: 0.85rem;
          color: var(--text-muted, #9ca3af);
          margin: 0 0 1rem;
          line-height: 1.5;
        }
        
        .project-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid var(--border, #e5e7eb);
        }
        
        .project-date,
        .project-views {
          font-size: 0.75rem;
          color: var(--text-muted, #9ca3af);
          display: flex;
          align-items: center;
        }
        
        /* Empty State */
        .empty-state-projects {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border: 2px dashed var(--border, #e5e7eb);
          border-radius: 20px;
          margin-top: 2rem;
        }
        
        .empty-icon {
          width: 80px;
          height: 80px;
          background: var(--primary-light, #FFF8E6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2rem;
          color: #FFD600;
        }
        
        .empty-state-projects h4 {
          font-weight: 700;
          color: var(--text-primary, #111827);
          margin-bottom: 0.5rem;
        }
        
        .empty-state-projects p {
          color: var(--text-muted, #9ca3af);
          max-width: 400px;
          margin: 0 auto 1.5rem;
        }
        
        .btn-upload-empty {
          display: inline-flex;
          align-items: center;
          padding: 0.875rem 2rem;
          background: linear-gradient(135deg, #FFD600 0%, #FFA000 100%);
          border: none;
          border-radius: 12px;
          color: #111827;
          font-size: 0.95rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        
        .btn-upload-empty:hover {
          transform: translateY(-2px);
          color: #111827;
        }
        
        /* Loading Skeleton */
        .loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .project-skeleton {
          background: white;
          border: 1px solid var(--border, #e5e7eb);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .skeleton-image {
          height: 200px;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .skeleton-content {
          padding: 1.25rem;
        }
        
        .skeleton-title {
          height: 20px;
          width: 70%;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
          margin-bottom: 0.75rem;
        }
        
        .skeleton-text {
          height: 14px;
          width: 100%;
          background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 4px;
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
          z-index: 1200;
          padding: 1rem;
        }
        
        .modal-content {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          text-align: center;
        }
        
        .modal-icon {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 1.5rem;
        }
        
        .modal-icon.delete {
          background: #fee2e2;
          color: #ef4444;
        }
        
        .modal-content h4 {
          font-weight: 700;
          color: var(--text-primary, #111827);
          margin-bottom: 0.5rem;
        }
        
        .modal-content p {
          color: var(--text-muted, #9ca3af);
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
        
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: center;
        }
        
        .btn-cancel {
          padding: 0.75rem 1.5rem;
          background: var(--bg-subtle, #f3f4f6);
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-secondary, #4b5563);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-cancel:hover {
          background: var(--border, #e5e7eb);
        }
        
        .btn-delete {
          padding: 0.75rem 1.5rem;
          background: #ef4444;
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-delete:hover {
          background: #dc2626;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .projects-header {
            flex-direction: column;
            align-items: stretch;
          }
          
          .btn-upload {
            width: 100%;
            justify-content: center;
          }
          
          .projects-stats {
            flex-wrap: wrap;
            gap: 1rem;
            padding: 1rem;
          }
          
          .stat-divider {
            display: none;
          }
          
          .stat-item {
            flex: 1;
            min-width: 80px;
          }
          
          .projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
};

export default VendorProjects;
