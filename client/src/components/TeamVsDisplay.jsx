import React from "react";
import { Box, Typography, Stack } from "@mui/material";

const TeamVsDisplay = ({ teamA, teamB }) => {
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
    >
      <Box sx={{ textAlign: "center", flex: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {teamA}
        </Typography>
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "text.secondary",
          px: 2,
        }}
      >
        vs
      </Typography>
      <Box sx={{ textAlign: "center", flex: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {teamB}
        </Typography>
      </Box>
    </Stack>
  );
};

export default TeamVsDisplay;
