import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  SportsCricket,
  Email,
  Lock,
  Person,
  Visibility,
  VisibilityOff,
  PersonAdd,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register(email, password, name);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "20%",
          right: "-10%",
          width: "60%",
          height: "60%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
          animation: "float 20s ease-in-out infinite reverse",
        },
        "@keyframes float": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -20px)" },
        },
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 4,
            backdropFilter: "blur(10px)",
            background: "rgba(255, 255, 255, 0.95)",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: "0 auto 16px",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
              }}
            >
              <SportsCricket sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: 700 }}
            >
              Create Account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Start scoring your cricket matches
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name (Optional)"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              margin="normal"
              helperText="At least 6 characters"
              inputProps={{ minLength: 6 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              startIcon={<PersonAdd />}
              sx={{
                py: 1.5,
                fontSize: "1.1rem",
                background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #0369a1 0%, #075985 100%)",
                },
              }}
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: 600, textDecoration: "none" }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Register;
