import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");

    // 1. User not logged in → go to login page (NOT vendor/:id)
    if (!vendorId) {
      navigate("/login", { replace: true });
      return;
    }

    // 2. If URL has an ID, but doesn't match → FIX URL instead of logging out
    if (id && id !== vendorId) {
      navigate(`/vendor/${vendorId}`, { replace: true });
      return;
    }

    // If everything is ok
    setChecking(false);
  }, [id, navigate]);

  if (checking) return <div>Loading...</div>;

  return children;
};

export default ProtectedRoute;
