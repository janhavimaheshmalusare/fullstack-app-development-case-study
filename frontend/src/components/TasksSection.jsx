import {
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useEffect, useState, useContext, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import KanbanBoard from "./KanbanBoard";

import "./TasksSection.css";

const TASK_STATUSES = [
  "NEW",
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED"
];

export default function TasksSection() {
  const { token } = useContext(AuthContext);
  const user = jwtDecode(token);
  const role = user.role;

  const isEditable = role === "TASK_TRACKER" || role === "ADMIN";
  const headers = { Authorization: `Bearer ${token}` };

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const [kanbanRefresh, setKanbanRefresh] = useState(0);

  const taskForm = useForm({
    defaultValues: {
      description: "",
      dueDate: "",
      status: "NEW",
      project: "",
      assignedTo: ""
    }
  });

  const fetchTasks = async () => {
    if (!isEditable) return;
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/tasks",
      { headers }
    );
    setTasks(res.data);
  };

  const fetchProjects = async () => {
    if (!isEditable) return;
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/projects",
      { headers }
    );
    setProjects(res.data);
  };

  const fetchUsers = async () => {
    if (!isEditable) return;
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/users",
      { headers }
    );
    setUsers(res.data);
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  const submitTask = async (data) => {
    if (!isEditable) return;

    const payload = {
      description: data.description,
      dueDate: data.dueDate || null,
      status: data.status,
      project: data.project,
      owner: data.assignedTo
    };

    try {
      if (editingTask) {
        const res = await axios.put(
          `http://localhost:5000/api/task-creator/tasks/${editingTask}`,
          payload,
          { headers }
        );

        setTasks((prev) =>
          prev.map((t) => (t._id === editingTask ? res.data : t))
        );

        setEditingTask(null);
      } else {
        const res = await axios.post(
          "http://localhost:5000/api/task-creator/tasks",
          payload,
          { headers }
        );

        setTasks((prev) => [...prev, res.data]);
      }

      setKanbanRefresh((prev) => prev + 1);

      taskForm.reset({
        description: "",
        dueDate: "",
        status: "NEW",
        project: "",
        assignedTo: ""
      });

    } catch (err) {
      console.error("TASK SUBMIT ERROR:", err.response?.data || err.message);
    }
  };

  const deleteTask = async (id) => {
    if (!isEditable) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/task-creator/tasks/${id}`,
        { headers }
      );

      setTasks((prev) => prev.filter((t) => t._id !== id));
      setKanbanRefresh((prev) => prev + 1);

    } catch (err) {
      console.error("DELETE TASK ERROR:", err.response?.data || err.message);
    }
  };

  const sortedTasks = useMemo(() => {
    const today = new Date();

    return [...tasks].sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate) : null;
      const dateB = b.dueDate ? new Date(b.dueDate) : null;

      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;

      return Math.abs(dateA - today) - Math.abs(dateB - today);
    });
  }, [tasks]);

  return (
    <>
      {isEditable && (
        <>
          <Paper className="tasks-glass">
            <Typography variant="h6" className="tasks-subtitle">
              {editingTask ? "Edit Task" : "Create Task"}
            </Typography>

            <form onSubmit={taskForm.handleSubmit(submitTask)}>
              <Controller
                name="description"
                control={taskForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    margin="normal"
                  />
                )}
              />

              <Controller
                name="dueDate"
                control={taskForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="date"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                )}
              />

              <Controller
                name="status"
                control={taskForm.control}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status">
                      {TASK_STATUSES.map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="project"
                control={taskForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Project</InputLabel>
                    <Select {...field} label="Project">
                      {projects.map((p) => (
                        <MenuItem key={p._id} value={p._id}>
                          {p.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="assignedTo"
                control={taskForm.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Assigned To</InputLabel>
                    <Select {...field} label="Assigned To">
                      {users.map((u) => (
                        <MenuItem key={u._id} value={u._id}>
                          {u.email}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Button type="submit" variant="contained" sx={{ mt: 2 }}>
                {editingTask ? "Update Task" : "Create Task"}
              </Button>
            </form>
          </Paper>

          <Paper className="tasks-glass">
            <Typography variant="h6" className="tasks-subtitle">
              All Tasks (Sorted by Closest Due Date)
            </Typography>

            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setEditingTask(task._id);
                          taskForm.reset({
                            description: task.description,
                            dueDate: task.dueDate?.split("T")[0] || "",
                            status: task.status,
                            project: task.project?._id,
                            assignedTo: task.owner?._id
                          });
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

      <KanbanBoard refreshTrigger={kanbanRefresh} />
    </>
  );
}
