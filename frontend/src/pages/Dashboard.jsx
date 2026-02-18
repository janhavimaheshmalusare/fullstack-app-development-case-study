import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader";

import DashboardHome from "../components/DashboardHome";
import PriorityBoard from "../components/PriorityBoard";
import KanbanBoard from "../components/KanbanBoard";

import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname.split("/").pop();

  const setActive = (tab) => {
    navigate(`/dashboard/${tab}`);
  };

  return (
    <div className="dashboard-background">
      <AppHeader active={active} setActive={setActive} />

      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome setActive={setActive} />} />
          <Route path="tasks" element={<KanbanBoard title="My Assigned Tasks" />} />
          <Route path="priority" element={<PriorityBoard />} />
        </Routes>
      </div>
    </div>
  );
}
