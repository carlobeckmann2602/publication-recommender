import { Grid } from "@react-three/drei";
import { useTheme } from "next-themes";
import React from "react";
import { Color, DoubleSide } from "three";

export default function RoomGrid({
  show,
  height = 0,
}: {
  show: boolean;
  height?: number;
}) {
  const { theme, resolvedTheme } = useTheme();

  const isThemeLight = () => {
    if (theme == "light" || (theme == "system" && resolvedTheme == "light"))
      return true;
    if (theme == "dark" || (theme == "system" && resolvedTheme == "dark"))
      return false;
    return;
  };

  const secondaryColor = isThemeLight()
    ? new Color("hsl(0, 0%, 96.1%)")
    : new Color("hsl(0, 0%, 14.9%)");

  const borderColor = isThemeLight()
    ? new Color("hsl(0, 0%, 56.8%)")
    : new Color("hsl(0, 0%, 14.9%)");

  if (show)
    return (
      <Grid
        position={[0, height - 0.5, 0]}
        args={[10, 10]}
        fadeDistance={40}
        fadeStrength={2}
        infiniteGrid={true}
        cellSize={1}
        cellThickness={0.5}
        cellColor={secondaryColor}
        sectionSize={2}
        sectionThickness={1}
        sectionColor={borderColor}
        side={DoubleSide}
      />
    );
}
