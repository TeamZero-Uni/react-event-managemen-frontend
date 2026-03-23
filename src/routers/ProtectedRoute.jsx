import Loader from "../components/loader";
import { useAuth } from "../hook/useAuth";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Loader />;

  if (!isAuthenticated) return <Navigate to="auth/login" replace />;


  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
