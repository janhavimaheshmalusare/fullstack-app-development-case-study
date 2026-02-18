import { 
  Box,
  Card,
  CardContent,
  Grid,
  Typography
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import "./PriorityBoard.css";

export default function PriorityBoard() {
  const { token } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/kanban/tasks",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const today = new Date().toDateString();

        const filtered = res.data.filter(task =>
          task.dueDate &&
          new Date(task.dueDate).toDateString() === today &&
          task.status !== "COMPLETED"
        );

        setTasks(filtered);
      } catch (err) {
        console.error("Error fetching priority tasks:", err);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  return (
    <Box className="priority-wrapper">
      <Grid container spacing={3}>
        {tasks.map(task => (
          <Grid item xs={12} md={4} key={task._id}>
            <Card 
              className="priority-card"
              sx={{ backgroundColor: "#fff3a6" }}
            >
              <CardContent>

                <Typography className="priority-description">
                  {task.description}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  className="priority-meta"
                >
                  Project: {task.project?.name}
                </Typography>

                <Typography
                  variant="caption"
                  display="block"
                  className="priority-date"
                >
                  Due Today
                </Typography>

              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
