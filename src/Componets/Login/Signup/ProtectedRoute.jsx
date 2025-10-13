import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const [checking, setChecking] = useState(true);
  const vendorId = localStorage.getItem("vendorId");

  useEffect(() => {
    if (!vendorId) {
      navigate(`/vendor/${id}`);
    }
    else if (id && vendorId !== id) {
      navigate(`/vendor/${id}`);
    } else {
      setChecking(false); 
    }
  }, [vendorId, id, navigate]);

  if (checking) {
    return <div>Loading...</div>; 
  }

  return children;
};

export default ProtectedRoute;
