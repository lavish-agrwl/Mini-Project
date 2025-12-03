import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const LoadingSpinner = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.50",
      }}
    >
      <Box sx={{ textAlign: "center" }}>
        <CircularProgress size={48} thickness={4} sx={{ mb: 2 }} />
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    </Box>
  );
};

export default LoadingSpinner;
