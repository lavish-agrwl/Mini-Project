import React from "react";
import { Box, Typography, Chip } from "@mui/material";

const BatsmanCard = ({ player, isStriker = false }) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        background: isStriker
          ? "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)"
          : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        border: 2,
        borderColor: isStriker ? "success.main" : "grey.300",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "all 0.3s",
        "&:hover": {
          boxShadow: 2,
        },
      }}
    >
      <Box>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>
          {player?.name || "Unknown"}
        </Typography>
        {isStriker && (
          <Chip
            label="★ STRIKE"
            size="small"
            color="success"
            sx={{ mt: 0.5, fontWeight: 600 }}
          />
        )}
      </Box>
      <Box sx={{ textAlign: "right" }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: isStriker ? "success.main" : "text.primary",
          }}
        >
          {player?.runs || 0}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({player?.ballsFaced || 0} balls)
        </Typography>
      </Box>
    </Box>
  );
};

export default BatsmanCard;
