import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import DashboardHome from "../components/DashboardHome";
import UsersManagement from "../components/UsersManagement";
import ProjectBoard from "../components/ProjectBoard";
import KanbanBoard from "../components/KanbanBoard";
import PriorityBoard from "../components/PriorityBoard";

import "./AdminDashboard.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname.split("/").pop();

  const setActive = (tab) => {
    navigate(`/admin/${tab}`);
  };

  return (
    <div className="admin-dashboard-background">
      <AppHeader active={active} setActive={setActive} />

      <div className="admin-dashboard-content">
        <div className="dashboard-container">
          <Routes>
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome setActive={setActive} />} />
            <Route path="users" element={<UsersManagement />} />
            <Route path="projects" element={<ProjectBoard />} />
            <Route path="tasks" element={<KanbanBoard />} />
            <Route path="priority" element={<PriorityBoard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
