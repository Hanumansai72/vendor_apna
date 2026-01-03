import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../Auth/AuthContext";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // 1. User not logged in
    if (!user) {
      navigate("/", { replace: true });
      return;
    }

    const vendorId = user.id;

    // 2. If URL has an ID, but doesn't match → FIX URL
    if (id && id !== vendorId) {
      navigate(`/vendor/${vendorId}`, { replace: true });
      return;
    }
  }, [id, navigate, user, loading]);

  if (loading) return <div>Loading...</div>;

  return children;
};

export default ProtectedRoute;
