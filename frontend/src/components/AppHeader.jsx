import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./AppHeader.css";

export default function AppHeader({ active, setActive }) {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const user = jwtDecode(token);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const getDisplayRole = (role) => {
    switch (role) {
      case "ADMIN":
        return "Admin";
      case "TASK_TRACKER":
        return "Task Creator";
      case "READ_ONLY":
        return "Read Only";
      default:
        return role;
    }
  };

  const navButton = (label, value) => (
    <Button
      className={`nav-button ${active === value ? "active" : ""}`}
      onClick={() => setActive(value)}
    >
      {label}
    </Button>
  );

  return (
    <AppBar position="static" className="app-header">
      <Toolbar className="toolbar">

        <Typography variant="h6" className="logo">
          TaskMeister
        </Typography>

        <Box className="nav-container">
          {navButton("Dashboard", "dashboard")}

          {user.role === "ADMIN" &&
            navButton("Users", "users")}

          {(user.role === "ADMIN" || user.role === "TASK_TRACKER") &&
            navButton("Projects", "projects")}

          {navButton("Tasks", "tasks")}

          {navButton("Priority", "priority")}
        </Box>

        <Box className="spacer" />

        <Box className="user-section">
          <Typography className="user-info">
            {user.name} ({getDisplayRole(user.role)})
          </Typography>

          <Button className="logout-button" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}
