import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

import { useEffect, useState, useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "../context/AuthContext";
import ProjectBoard from "./ProjectBoard";

import "./ProjectsSection.css";

export default function ProjectsSection() {
  const { token } = useContext(AuthContext);
  const user = jwtDecode(token);
  const role = user.role;

  const isEditable = role === "TASK_TRACKER" || role === "ADMIN";
  const headers = { Authorization: `Bearer ${token}` };

  const [allProjects, setAllProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingProject, setEditingProject] = useState(null);

  const projectForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      owner: ""
    }
  });

  const fetchAllProjects = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/projects",
      { headers }
    );
    setAllProjects(res.data);
  };

  const fetchMyProjects = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/projects/my",
      { headers }
    );
    setMyProjects(res.data);
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
    fetchAllProjects();
    fetchMyProjects();
    fetchUsers();
  }, []);

  const submitProject = async (data) => {
    if (!isEditable) return;

    if (editingProject) {
      const res = await axios.put(
        `http://localhost:5000/api/task-creator/projects/${editingProject}`,
        data,
        { headers }
      );

      setAllProjects((prev) =>
        prev.map((p) => (p._id === editingProject ? res.data : p))
      );

      setMyProjects((prev) =>
        prev.map((p) => (p._id === editingProject ? res.data : p))
      );

      setEditingProject(null);
    } else {
      const res = await axios.post(
        "http://localhost:5000/api/task-creator/projects",
        data,
        { headers }
      );

      setAllProjects((prev) => [...prev, res.data]);

      if (res.data.owner?._id === user.id) {
        setMyProjects((prev) => [...prev, res.data]);
      }
    }

    projectForm.reset({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      owner: ""
    });
  };

  const deleteProject = async (id) => {
    if (!isEditable) return;

    await axios.delete(
      `http://localhost:5000/api/task-creator/projects/${id}`,
      { headers }
    );

    setAllProjects((prev) => prev.filter((p) => p._id !== id));
    setMyProjects((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <Box className="projects-section-container">

      {isEditable && (
        <Box className="projects-glass-card">
          <Typography
            variant="h6"
            className="projects-form-title"
          >
            {editingProject ? "Edit Project" : "Create Project"}
          </Typography>

          <form
            onSubmit={projectForm.handleSubmit(submitProject)}
            className="projects-form"
          >
            <Controller
              name="name"
              control={projectForm.control}
              rules={{ required: true }}
              render={({ field }) => (
                <TextField {...field} label="Project Name" fullWidth />
              )}
            />

            <Controller
              name="description"
              control={projectForm.control}
              render={({ field }) => (
                <TextField {...field} label="Description" fullWidth />
              )}
            />

            <Controller
              name="startDate"
              control={projectForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="endDate"
              control={projectForm.control}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />

            <Controller
              name="owner"
              control={projectForm.control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Owner</InputLabel>
                  <Select {...field} label="Owner">
                    {users.map((u) => (
                      <MenuItem key={u._id} value={u._id}>
                        {u.email}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            />

            <Button
              type="submit"
              variant="contained"
              className="projects-submit-btn"
            >
              {editingProject ? "Update Project" : "Create Project"}
            </Button>
          </form>

          <Divider className="projects-divider" />

          {allProjects.map((p) => (
            <Box key={p._id} className="project-row">
              <Typography className="project-name">
                {p.name}
              </Typography>

              <Button
                startIcon={<EditIcon />}
                className="project-action-btn"
                onClick={() => {
                  setEditingProject(p._id);
                  projectForm.reset({
                    name: p.name,
                    description: p.description,
                    startDate: p.startDate?.split("T")[0],
                    endDate: p.endDate?.split("T")[0],
                    owner: p.owner?._id
                  });
                }}
              >
                Edit
              </Button>

              <Button
                color="error"
                startIcon={<DeleteIcon />}
                className="project-action-btn"
                onClick={() => deleteProject(p._id)}
              >
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      )}

      <ProjectBoard projects={myProjects} />
    </Box>
  );
}
