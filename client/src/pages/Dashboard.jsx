import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Divider,
  Stack,
} from "@mui/material";
import {
  SportsCricket,
  Logout,
  Add,
  PlayArrow,
  Edit,
  Visibility,
  Delete,
  CalendarToday,
  Timer,
  EmojiEvents,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { matchAPI } from "../services/api";

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

  const getStatusChip = (status) => {
    const config = {
      not_started: { label: "Not Started", color: "default" },
      in_progress: { label: "Live", color: "primary" },
      finished: { label: "Finished", color: "success" },
    };
    const { label, color } = config[status];
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{
          fontWeight: 600,
          ...(status === "in_progress" && {
            animation: "pulse 2s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { opacity: 1 },
              "50%": { opacity: 0.7 },
            },
          }),
        }}
      />
    );
  };

  const getMatchScore = (match) => {
    if (match.status === "not_started") return "Not started";

    let scoreText = "";
    match.innings.forEach((inning, idx) => {
      const teamName = match.teams[inning.battingTeamIndex].name;
      scoreText += `${teamName}: ${inning.totalRuns}/${inning.wickets}`;
      if (idx < match.innings.length - 1) scoreText += " | ";
    });
    return scoreText || "No score yet";
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
                Cricket Scoreboard
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
          <Paper sx={{ p: 6, textAlign: "center" }}>
            <Typography color="text.secondary">Loading matches...</Typography>
          </Paper>
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
                <Card
                  elevation={2}
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s",
                    borderLeft: 4,
                    borderColor: "primary.main",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, flexGrow: 1, pr: 1 }}
                      >
                        {match.name}
                      </Typography>
                      {getStatusChip(match.status)}
                    </Box>

                    <Stack spacing={2}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          background:
                            "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          <SportsCricket fontSize="small" />
                          <span style={{ color: "#0284c7" }}>
                            {match.teams[0].name}
                          </span>
                          <span style={{ color: "#9ca3af" }}>vs</span>
                          <span style={{ color: "#64748b" }}>
                            {match.teams[1].name}
                          </span>
                        </Typography>
                      </Paper>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Timer fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {match.oversPerInnings} overs per innings
                        </Typography>
                      </Box>

                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {getMatchScore(match)}
                      </Typography>

                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <CalendarToday fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(match.matchDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>

                  <Divider />

                  <CardActions sx={{ p: 2, gap: 1 }}>
                    {match.status === "not_started" ? (
                      <>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<PlayArrow />}
                          onClick={() => navigate(`/match/${match._id}/setup`)}
                          sx={{ flexGrow: 1 }}
                        >
                          Start
                        </Button>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/match/${match._id}/edit`)}
                          title="Edit match details"
                        >
                          <Edit />
                        </IconButton>
                      </>
                    ) : match.status === "in_progress" ? (
                      <Button
                        variant="contained"
                        color="info"
                        size="small"
                        startIcon={<PlayArrow />}
                        onClick={() => navigate(`/match/${match._id}/live`)}
                        sx={{ flexGrow: 1 }}
                      >
                        Continue Live
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/match/${match._id}/view`)}
                        sx={{ flexGrow: 1 }}
                      >
                        View
                      </Button>
                    )}
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteMatch(match._id)}
                      title="Delete match"
                    >
                      <Delete />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
