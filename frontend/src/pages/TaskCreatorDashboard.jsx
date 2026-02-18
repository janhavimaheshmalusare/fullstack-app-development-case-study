import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

import AppHeader from "../components/AppHeader";
import DashboardHome from "../components/DashboardHome";
import ProjectsSection from "../components/ProjectsSection";
import TasksSection from "../components/TasksSection";
import PriorityBoard from "../components/PriorityBoard";

import "./TaskCreatorDashboard.css";

export default function TaskCreatorDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const active = location.pathname.split("/").pop();

  const setActive = (tab) => {
    navigate(`/tasks/${tab}`);
  };

  return (
    <div className="taskcreator-dashboard-background">
      <AppHeader active={active} setActive={setActive} />

      <div className="taskcreator-dashboard-content">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardHome setActive={setActive} />} />
          <Route path="projects" element={<ProjectsSection />} />
          <Route path="tasks" element={<TasksSection />} />
          <Route path="priority" element={<PriorityBoard />} />
        </Routes>
      </div>
    </div>
  );
}
