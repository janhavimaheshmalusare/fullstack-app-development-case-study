import {
  Box,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  Modal,
  IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./KanbanBoard.css";

const TASK_STATUSES = [
  "NEW",
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED"
];

export default function KanbanBoard({ refreshTrigger }) {
  const { token } = useContext(AuthContext);

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/kanban/tasks",
          { headers }
        );
        setTasks(res.data);
      } catch (err) {
        console.error("Failed to fetch tasks", err);
      }
    };

    fetchTasks();
  }, [refreshTrigger, token]);

  const updateTaskStatus = async (id, status) => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/kanban/tasks/${id}/status`,
        { status },
        { headers }
      );

      const updatedTask = res.data;

      setTasks((prev) =>
        prev.map((task) =>
          task._id === id ? updatedTask : task
        )
      );

      if (selectedTask && selectedTask._id === id) {
        setSelectedTask(null);
      }

    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const sortByDueDate = (tasksArray) => {
    return [...tasksArray].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  };

  return (
    <>
      <Box className="kanban-wrapper">
        <Box className="kanban-board">
          {TASK_STATUSES.map((status) => {
            const statusTasks = sortByDueDate(
              tasks.filter((task) => task.status === status)
            );

            return (
              <Box
                key={status}
                className={`kanban-column ${status}`}
              >
                <Box className="kanban-column-header">
                  <Typography className="kanban-column-title">
                    {status.replace("_", " ")}
                  </Typography>
                  <Typography className="kanban-count">
                    {statusTasks.length}
                  </Typography>
                </Box>

                <Box className="kanban-column-content">
                  {statusTasks.map((task) => (
                    <Card
                      key={task._id}
                      className="kanban-card"
                      onClick={() => setSelectedTask(task)}
                    >
                      <CardContent>
                        <Typography className="kanban-card-description">
                          {task.description}
                        </Typography>

                        <Typography
                          variant="caption"
                          display="block"
                          className="kanban-card-meta"
                        >
                          Project: {task.project?.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          display="block"
                          className="kanban-card-meta"
                        >
                          Due: {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "No due date"}
                        </Typography>

                        <Select
                          size="small"
                          fullWidth
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateTaskStatus(task._id, e.target.value);
                          }}
                          className="kanban-card-select"
                        >
                          {TASK_STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s.replace("_", " ")}
                            </MenuItem>
                          ))}
                        </Select>

                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      <Modal
        open={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
      >
        <Box className="task-modal">
          {selectedTask && (
            <>
              <Box className="task-modal-header">
                <Typography variant="h6">
                  Task Details
                </Typography>
                <IconButton onClick={() => setSelectedTask(null)}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Typography className="task-modal-description">
                {selectedTask.description}
              </Typography>

              <Typography className="task-modal-meta">
                Project: {selectedTask.project?.name}
              </Typography>

              <Typography className="task-modal-meta">
                Due: {selectedTask.dueDate
                  ? new Date(selectedTask.dueDate).toLocaleDateString()
                  : "No due date"}
              </Typography>

              <Select
                fullWidth
                size="small"
                value={selectedTask.status}
                onChange={(e) =>
                  updateTaskStatus(selectedTask._id, e.target.value)
                }
                sx={{ mt: 2 }}
              >
                {TASK_STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s.replace("_", " ")}
                  </MenuItem>
                ))}
              </Select>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
}
