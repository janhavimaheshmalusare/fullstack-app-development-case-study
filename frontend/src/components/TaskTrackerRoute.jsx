import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

export default function TaskTrackerRoute({ children }) {
  const { token } = useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;

  const user = jwtDecode(token);
  return user.role === "TASK_TRACKER"
    ? children
    : <Navigate to="/dashboard" />;
}
