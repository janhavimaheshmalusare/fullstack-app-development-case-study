import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useForm, Controller } from "react-hook-form";
import "./UsersManagement.css";

const ROLES = ["ADMIN", "TASK_TRACKER", "READ_ONLY"];

export default function UsersManagement() {
  const { token } = useContext(AuthContext);

  const headers = {
    Authorization: `Bearer ${token}`
  };

  const [roles, setRoles] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState("");

  const {
    handleSubmit,
    control,
    reset
  } = useForm({
    defaultValues: {
      email: "",
      role: "READ_ONLY"
    }
  });

  const {
    handleSubmit: handleUpdateSubmit,
    control: updateControl,
    reset: resetUpdate
  } = useForm();

  const fetchRoles = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/admin/roles",
      { headers }
    );
    setRoles(res.data);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const createRole = async (data) => {
    await axios.post(
      "http://localhost:5000/api/admin/roles",
      data,
      { headers }
    );
    reset();
    fetchRoles();
  };

  const openUpdateDialog = (email, role) => {
    setSelectedEmail(email);
    resetUpdate({ email, role });
    setOpen(true);
  };

  const updateRole = async (data) => {
    await axios.put(
      `http://localhost:5000/api/admin/roles/${selectedEmail}`,
      data,
      { headers }
    );
    setOpen(false);
    fetchRoles();
  };

  const deleteRole = async (email) => {
    await axios.delete(
      `http://localhost:5000/api/admin/roles/${email}`,
      { headers }
    );
    fetchRoles();
  };

  return (
    <Box className="users-page">
      <Box className="users-glass-card">

        <Box className="authorize-section">
          <Typography variant="h6">
            Authorize New User
          </Typography>

          <form onSubmit={handleSubmit(createRole)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  fullWidth
                  margin="normal"
                />
              )}
            />

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select {...field} fullWidth>
                  {ROLES.map((r) => (
                    <MenuItem key={r} value={r}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />

            <Button type="submit" variant="contained" sx={{ mt: 2 }}>
              Add Authorization
            </Button>
          </form>
        </Box>

        <Table className="users-table">
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {roles.map((r) => (
              <TableRow key={r._id}>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell>
                  <Button onClick={() => openUpdateDialog(r.email, r.role)}>
                    Update
                  </Button>
                  <Button
                    color="error"
                    onClick={() => deleteRole(r.email)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Update Authorization</DialogTitle>
          <form onSubmit={handleUpdateSubmit(updateRole)}>
            <DialogContent>
              <Controller
                name="email"
                control={updateControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    margin="normal"
                  />
                )}
              />
              <Controller
                name="role"
                control={updateControl}
                render={({ field }) => (
                  <Select {...field} fullWidth>
                    {ROLES.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained">
                Update
              </Button>
            </DialogActions>
          </form>
        </Dialog>

      </Box>
    </Box>
  );
}
