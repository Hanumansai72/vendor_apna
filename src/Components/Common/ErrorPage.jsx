import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * ErrorPage Component
 * Handles 404 (Not Found) and 403 (Access Denied) errors
 * 
 * Usage:
 * - For 404: <ErrorPage type="404" />
 * - For 403: <ErrorPage type="403" />
 * - Auto-detect from location state: <ErrorPage />
 */
function ErrorPage({ type }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Get error type from props, location state, or default to 404
    const errorType = type || location.state?.errorType || '404';
    const message = location.state?.message || null;

    const errorConfig = {
        '404': {
            code: '404',
            title: 'Page Not Found',
            description: message || "Oops! The page you're looking for doesn't exist or has been moved.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                    <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" />
                    <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" />
                </svg>
            ),
            primaryAction: { label: 'Go Home', path: '/' },
            secondaryAction: { label: 'Go Back', action: () => navigate(-1) }
        },
        '403': {
            code: '403',
            title: 'Access Denied',
            description: message || "You don't have permission to access this page. Please login with the correct account.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    <circle cx="12" cy="16" r="1" />
                </svg>
            ),
            primaryAction: { label: 'Login', path: '/login' },
            secondaryAction: { label: 'Go Home', path: '/' }
        },
        '401': {
            code: '401',
            title: 'Authentication Required',
            description: message || "Please login to access this page.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
            primaryAction: { label: 'Login', path: '/login' },
            secondaryAction: { label: 'Go Home', path: '/' }
        },
        '500': {
            code: '500',
            title: 'Server Error',
            description: message || "Something went wrong on our end. Please try again later.",
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
            ),
            primaryAction: { label: 'Try Again', action: () => window.location.reload() },
            secondaryAction: { label: 'Go Home', path: '/' }
        }
    };

    const config = errorConfig[errorType] || errorConfig['404'];

    const handlePrimaryAction = () => {
        if (config.primaryAction.path) {
            navigate(config.primaryAction.path);
        } else if (config.primaryAction.action) {
            config.primaryAction.action();
        }
    };

    const handleSecondaryAction = () => {
        if (config.secondaryAction.path) {
            navigate(config.secondaryAction.path);
        } else if (config.secondaryAction.action) {
            config.secondaryAction.action();
        }
    };

    return (
        <>
            <style>{`
        .error-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          padding: 2rem;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .error-container {
          text-align: center;
          max-width: 500px;
        }

        .error-icon-wrapper {
          width: 150px;
          height: 150px;
          margin: 0 auto 2rem;
          background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 60px rgba(255, 215, 0, 0.3);
        }

        .error-icon-wrapper svg {
          width: 70px;
          height: 70px;
          color: #1a1a2e;
        }

        .error-code {
          font-size: 6rem;
          font-weight: 800;
          color: #FFD700;
          line-height: 1;
          margin-bottom: 0.5rem;
          text-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        .error-title {
          font-size: 2rem;
          font-weight: 700;
          color: white;
          margin-bottom: 1rem;
        }

        .error-description {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .error-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary-error {
          padding: 14px 32px;
          background: linear-gradient(135deg, #FFD700 0%, #FFC300 100%);
          color: #1a1a2e;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary-error:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 30px rgba(255, 215, 0, 0.4);
        }

        .btn-secondary-error {
          padding: 14px 32px;
          background: transparent;
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary-error:hover {
          border-color: #FFD700;
          color: #FFD700;
        }

        .decoration-circles {
          position: fixed;
          pointer-events: none;
        }

        .circle-1 {
          top: 10%;
          left: 10%;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.1), transparent 70%);
          border-radius: 50%;
        }

        .circle-2 {
          bottom: 10%;
          right: 10%;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.08), transparent 70%);
          border-radius: 50%;
        }

        @media (max-width: 576px) {
          .error-code {
            font-size: 4rem;
          }
          .error-title {
            font-size: 1.5rem;
          }
          .error-description {
            font-size: 1rem;
          }
          .error-actions {
            flex-direction: column;
          }
          .btn-primary-error,
          .btn-secondary-error {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

            <div className="error-page">
                <div className="decoration-circles circle-1" />
                <div className="decoration-circles circle-2" />

                <motion.div
                    className="error-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="error-icon-wrapper"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                    >
                        {config.icon}
                    </motion.div>

                    <motion.div
                        className="error-code"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        {config.code}
                    </motion.div>

                    <motion.h1
                        className="error-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        {config.title}
                    </motion.h1>

                    <motion.p
                        className="error-description"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {config.description}
                    </motion.p>

                    <motion.div
                        className="error-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <button className="btn-primary-error" onClick={handlePrimaryAction}>
                            {config.primaryAction.label}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" />
                                <polyline points="12 5 19 12 12 19" />
                            </svg>
                        </button>
                        <button className="btn-secondary-error" onClick={handleSecondaryAction}>
                            {config.secondaryAction.label}
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}

export default ErrorPage;
