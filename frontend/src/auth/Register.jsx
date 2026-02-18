import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bgimage.jpg";

import "./Register.css";

export default function Register() {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: ""
    }
  });

  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/register",
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      alert("Registered successfully. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Box
      className="register-background"
      sx={{ backgroundImage: `url(${bgImage})` }}
    >
      <Paper className="register-card" elevation={12}>
        <Typography variant="h4" className="register-title">
          Register
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="name"
            control={control}
            rules={{ required: "Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Name"
                margin="normal"
                error={!!errors.name}
                helperText={errors.name?.message}
                className="register-input"
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            rules={{
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email format"
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email"
                margin="normal"
                error={!!errors.email}
                helperText={errors.email?.message}
                className="register-input"
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{
              required: "Password is required",
              minLength: {
                value: 5,
                message: "Password must be at least 5 characters"
              }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                error={!!errors.password}
                helperText={errors.password?.message}
                className="register-input"
              />
            )}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            className="register-button"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
