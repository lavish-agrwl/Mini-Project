import React from "react";
import { Chip } from "@mui/material";

const StatusChip = ({ status }) => {
  const config = {
    not_started: { label: "Not Started", color: "default" },
    in_progress: { label: "Live", color: "primary" },
    finished: { label: "Finished", color: "success" },
  };

  const { label, color } = config[status] || config.not_started;

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

export default StatusChip;
