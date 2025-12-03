import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Paper,
  Divider,
  Stack,
  Box,
  IconButton,
} from "@mui/material";
import {
  SportsCricket,
  PlayArrow,
  Edit,
  Visibility,
  Delete,
  CalendarToday,
  Timer,
} from "@mui/icons-material";
import StatusChip from "./StatusChip";

const MatchCard = ({ match, onDelete }) => {
  const navigate = useNavigate();

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
          <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1, pr: 1 }}>
            {match.name}
          </Typography>
          <StatusChip status={match.status} />
        </Box>

        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%)",
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
              <span style={{ color: "#0284c7" }}>{match.teams[0].name}</span>
              <span style={{ color: "#9ca3af" }}>vs</span>
              <span style={{ color: "#64748b" }}>{match.teams[1].name}</span>
            </Typography>
          </Paper>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
          onClick={() => onDelete(match._id)}
          title="Delete match"
        >
          <Delete />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MatchCard;
