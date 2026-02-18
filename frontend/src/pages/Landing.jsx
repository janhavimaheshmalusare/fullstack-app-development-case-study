import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

export default function Landing() {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  const user = jwtDecode(token);

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "TASK_TRACKER") {
    return <Navigate to="/tasks/dashboard" replace />;
  }

  return <Navigate to="/dashboard/dashboard" replace />;
}
