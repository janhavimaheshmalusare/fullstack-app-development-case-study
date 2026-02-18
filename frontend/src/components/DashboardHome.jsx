import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { jwtDecode } from "jwt-decode";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import "./DashboardHome.css";

const COLORS = ["#8b5cf6", "#3b82f6", "#06b6d4", "#10b981", "#f59e0b"];

export default function DashboardHome({ setActive }) {
  const { token } = useContext(AuthContext);
  const user = jwtDecode(token);

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [pieData, setPieData] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [urgentTasks, setUrgentTasks] = useState([]);

  const normalizeDate = (date) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const today = useMemo(() => normalizeDate(new Date()), []);

  useEffect(() => {
    if (!token) return;

    fetchPieData();
    fetchProjects();
    fetchUrgentTasks();

    if (user.role === "ADMIN") {
      fetchUsers();
    }
  }, [token]);

  const fetchPieData = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/task-creator/tasks/my",
        { headers }
      );

      const grouped = {};

      res.data.forEach(task => {
        const status = (task.status || "").trim().toUpperCase();
        grouped[status] = (grouped[status] || 0) + 1;
      });

      const formatted = Object.keys(grouped).map(status => ({
        name: status,
        value: grouped[status]
      }));

      setPieData(formatted);
    } catch (err) {
      console.error("FETCH PIE ERROR:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/task-creator/users",
        { headers }
      );
      setUsers(res.data);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/task-creator/projects/my",
        { headers }
      );
      setProjects(res.data.slice(0, 3));
    } catch (err) {
      console.error("FETCH PROJECTS ERROR:", err);
    }
  };

  const fetchUrgentTasks = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/task-creator/tasks/my",
        { headers }
      );

      const incompleteTasks = res.data.filter(task => {
        const status = (task.status || "").trim().toUpperCase();
        return status !== "COMPLETED";
      });

      const todaysTasks = [];
      const overdueTasks = [];
      const futureTasks = [];

      incompleteTasks.forEach(task => {
        if (!task.dueDate) return;

        const due = normalizeDate(task.dueDate);

        if (due.getTime() === today.getTime()) {
          todaysTasks.push(task);
        } else if (due < today) {
          overdueTasks.push(task);
        } else {
          futureTasks.push(task);
        }
      });

      todaysTasks.sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );

      overdueTasks.sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );

      futureTasks.sort(
        (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
      );

      let finalTasks = [];

      finalTasks = [...todaysTasks];

      if (finalTasks.length < 3) {
        finalTasks = [
          ...finalTasks,
          ...overdueTasks.slice(0, 3 - finalTasks.length)
        ];
      }

      if (finalTasks.length === 0) {
        finalTasks = futureTasks.slice(0, 3);
      }

      setUrgentTasks(finalTasks.slice(0, 3));
    } catch (err) {
      console.error("FETCH URGENT TASKS ERROR:", err);
    }
  };

  const PieComponent = (
    <Card className="dashboard-card">
      <CardContent>
        <Typography className="card-title">
          My Task Overview
        </Typography>

        <div className="pie-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );

  const ProjectsCard = (
    <Card className="dashboard-card">
      <CardContent>
        <Typography className="card-title">
          Recent Projects
        </Typography>

        {projects.map(project => (
          <Typography
            key={project._id}
            className="card-subtext"
          >
            {project.name}
          </Typography>
        ))}

        <Button
          className="view-button"
          onClick={() => setActive("projects")}
        >
          VIEW ALL →
        </Button>
      </CardContent>
    </Card>
  );

  const TasksCard = (
    <Card className="dashboard-card">
      <CardContent>
        <Typography className="card-title">
          Most Urgent Tasks
        </Typography>

        {urgentTasks.length === 0 && (
          <Typography className="card-subtext">
            No pending tasks!
          </Typography>
        )}

        {urgentTasks.map(task => {
          const due = normalizeDate(task.dueDate);
          const isOverdue = due < today;

          return (
            <Typography
              key={task._id}
              className={`card-subtext ${
                isOverdue ? "overdue-task" : ""
              }`}
            >
              {task.description} —{" "}
              {new Date(task.dueDate).toLocaleDateString()}
            </Typography>
          );
        })}

        <Button
          className="view-button"
          onClick={() => setActive("tasks")}
        >
          VIEW ALL →
        </Button>
      </CardContent>
    </Card>
  );

  const UsersTable = (
    <Card className="dashboard-card">
      <CardContent>
        <Typography className="card-title">
          Registered Users
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(u => (
              <TableRow key={u._id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <Box className="dashboard-home">
      {user.role === "ADMIN" && (
        <div className="dashboard-grid-2x2">
          {PieComponent}
          {UsersTable}
          {ProjectsCard}
          {TasksCard}
        </div>
      )}

      {user.role === "TASK_TRACKER" && (
        <div className="dashboard-grid-2col">
          {PieComponent}
          {ProjectsCard}
          {TasksCard}
        </div>
      )}

      {user.role === "READ_ONLY" && (
        <div className="dashboard-grid-2col">
          {PieComponent}
          {TasksCard}
        </div>
      )}
    </Box>
  );
}
