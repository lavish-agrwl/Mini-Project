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
  Divider,
  Chip,
} from "@mui/material";
import {
  SportsCricket,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

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
          top: "-50%",
          right: "-50%",
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
          animation: "pulse 15s ease-in-out infinite",
        },
        "@keyframes pulse": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
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
              Cricket Scoreboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Sign in to manage your matches
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
              startIcon={<LoginIcon />}
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
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{" "}
              <Link
                component={RouterLink}
                to="/register"
                sx={{ fontWeight: 600, textDecoration: "none" }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="Demo Account" size="small" />
          </Divider>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
              textAlign: "center",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              Try Demo Account
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", fontWeight: 600 }}
            >
              demo@cricket.com / demo123
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
