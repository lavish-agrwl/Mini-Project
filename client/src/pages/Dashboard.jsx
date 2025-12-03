import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  AppBar,
  Toolbar,
  Paper,
} from "@mui/material";
import { SportsCricket, Logout, Add, EmojiEvents } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { matchAPI } from "../services/api";
import MatchCard from "../components/MatchCard";
import LoadingSpinner from "../components/LoadingSpinner";

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await matchAPI.getAll();
      setMatches(response.data.matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (id) => {
    if (window.confirm("Are you sure you want to delete this match?")) {
      try {
        await matchAPI.delete(id);
        fetchMatches();
      } catch (error) {
        console.error("Error deleting match:", error);
        alert("Failed to delete match");
      }
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
        }}
      >
        <Toolbar sx={{ py: 2 }}>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}
          >
            <SportsCricket sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                CricScore
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name || user?.email}!
              </Typography>
            </Box>
          </Box>
          <Button
            color="inherit"
            onClick={logout}
            startIcon={<Logout />}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.25)" },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <EmojiEvents color="primary" /> My Matches
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => navigate("/create-match")}
          >
            Create New Match
          </Button>
        </Box>

        {loading ? (
          <LoadingSpinner message="Loading matches..." />
        ) : matches.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <SportsCricket
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No matches yet. Create your first match!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/create-match")}
              sx={{ mt: 2 }}
            >
              Create Match
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {matches.map((match) => (
              <Grid item xs={12} sm={6} lg={4} key={match._id}>
                <MatchCard match={match} onDelete={handleDeleteMatch} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
