import React from "react";
import { Button } from "@mui/material";

const BallButton = ({
  label,
  onClick,
  color = "primary",
  disabled = false,
}) => {
  return (
    <Button
      variant="contained"
      size="large"
      onClick={onClick}
      disabled={disabled}
      color={color}
      sx={{
        fontSize: "1.25rem",
        fontWeight: 700,
        minWidth: "60px",
        minHeight: "60px",
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover": {
          transform: "scale(1.05)",
        },
        "&:active": {
          transform: "scale(0.95)",
        },
      }}
    >
      {label}
    </Button>
  );
};

export default BallButton;
