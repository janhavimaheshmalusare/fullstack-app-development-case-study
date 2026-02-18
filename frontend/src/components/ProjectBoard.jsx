import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./ProjectBoard.css";

export default function ProjectBoard({
  title = "My Projects",
  projects: propProjects
}) {
  const { token } = useContext(AuthContext);

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [projects, setProjects] = useState([]);

  const fetchProjects = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/task-creator/projects/my",
      { headers }
    );
    setProjects(res.data);
  };

  useEffect(() => {
    if (!propProjects) {
      fetchProjects();
    }
  }, []);

  const displayProjects = propProjects || projects;

  return (
    <Box mt={6} className="project-board-wrapper">
      
      <Box className="project-title-wrapper">
        <Typography
          variant="h5"
          className="project-board-title"
        >
          {title}
        </Typography>
      </Box>

      <Grid
        container
        spacing={4}
        className="project-grid"
      >
        {displayProjects.map((project) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={project._id}
          >
            <Card className="project-card">
              <CardContent>
                <Typography
                  variant="h6"
                  className="project-name"
                >
                  {project.name}
                </Typography>

                <Typography
                  variant="body2"
                  className="project-description"
                >
                  {project.description}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  className="project-meta"
                >
                  Start:{" "}
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString()
                    : "N/A"}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  className="project-meta"
                >
                  End:{" "}
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString()
                    : "N/A"}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  className="project-owner"
                >
                  Owner: {project.owner?.email}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
