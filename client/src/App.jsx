import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateMatch from "./pages/CreateMatch";
import EditMatch from "./pages/EditMatch";
import MatchSetup from "./pages/MatchSetup";
import LiveScoring from "./pages/LiveScoring";
import MatchView from "./pages/MatchView";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-match"
              element={
                <ProtectedRoute>
                  <CreateMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id/edit"
              element={
                <ProtectedRoute>
                  <EditMatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id/setup"
              element={
                <ProtectedRoute>
                  <MatchSetup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id/live"
              element={
                <ProtectedRoute>
                  <LiveScoring />
                </ProtectedRoute>
              }
            />
            <Route
              path="/match/:id/view"
              element={
                <ProtectedRoute>
                  <MatchView />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
