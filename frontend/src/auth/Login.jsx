import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios from "axios";
import { useContext } from "react";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import bgImage from "../assets/bgimage.jpg";

import "./Login.css";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      const token = res.data.token;
      login(token);

      navigate("/", { replace: true });

    } catch (err) {
      console.error(err);
      alert("Invalid credentials");
    }
  };

  return (
    <Box
      className="login-background"
      sx={{ backgroundImage: `url(${bgImage})` }}
    >
      <Paper className="login-card" elevation={12}>
        <Typography variant="h4" className="login-title">
          Login
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
                className="login-input"
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
                className="login-input"
              />
            )}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            className="login-button"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>

          <Button
            fullWidth
            type="button"
            variant="contained"
            className="login-button"
            onClick={() => navigate("/register")}
            sx={{ mt: 2 }}
          >
            NEW HERE? REGISTER
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
