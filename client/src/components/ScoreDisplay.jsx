import React from "react";
import { Box, Typography } from "@mui/material";

const ScoreDisplay = ({ runs, wickets, overs, maxOvers }) => {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography
          variant="h2"
          sx={{ fontWeight: 700, fontSize: { xs: "3rem", md: "4rem" } }}
        >
          {runs}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 600, color: "text.secondary" }}
        >
          /{wickets}
        </Typography>
      </Box>
      <Typography variant="body1" sx={{ mt: 1, color: "text.secondary" }}>
        {overs?.toFixed(1)} / {maxOvers} overs
      </Typography>
    </Box>
  );
};

export default ScoreDisplay;
