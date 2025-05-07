"use client";

import { Grid } from "ldrs/react";
import "ldrs/react/Grid.css";

export function LoadingSpinner({
  size = "80",
  speed = "1.5",
  color,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}
    >
      <Grid
        size={size}
        speed={speed}
        color={color || "var(--loader-color, hsl(var(--foreground)))"}
      />
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  );
}
