import { GroupProps } from "@react-three/fiber";
import { useTheme } from "next-themes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Color, DoubleSide, Mesh, Vector3 } from "three";
import { Text } from "@react-three/drei";

function RoomCenter({
  description,
  color,
  ...props
}: { description?: string; color?: string } & GroupProps) {
  const descPaddingBlock = 0.25;
  const descPaddingInline = 0.75;
  const descBorderWidth = 0.02;

  const { theme, resolvedTheme } = useTheme();

  const isThemeLight = () => {
    if (theme == "light" || (theme == "system" && resolvedTheme == "light"))
      return true;
    if (theme == "dark" || (theme == "system" && resolvedTheme == "dark"))
      return false;
    return;
  };

  const accentColor = isThemeLight()
    ? new Color("hsl(294.7, 72.4%, 39.8%)")
    : new Color("hsl(293.4, 69.5%, 48.8%)");

  const foregroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 3.9%)")
    : new Color("hsl(0, 0%, 98%)");

  const backgroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 100%)")
    : new Color("hsl(0, 0%, 9%)");

  const fontPropsTitle = {
    color: foregroundColor,
    font: "/Inter-Bold.woff",
    fontSize: 1.2,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };

  const descRef = useRef<Mesh>(null);

  const [delayed, setDelayed] = useState(true);
  const [descWidth, setDescWidth] = useState(1);
  const [descHeight, setDescHeight] = useState(0.2);
  const [renderDone, setRenderDone] = useState(false);

  const renderWidth = useCallback(() => {
    descRef.current?.geometry.computeBoundingBox();

    if (descRef.current?.geometry.boundingBox) {
      const sizeDesc = new Vector3();
      descRef.current?.geometry.boundingBox.getSize(sizeDesc);

      const width = (sizeDesc.x + descPaddingInline * 2) * 0.1;
      const height = (sizeDesc.y + descPaddingBlock * 2) * 0.1;

      setDescWidth(width);
      setDescHeight(height);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      renderWidth();
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [renderWidth, renderDone]);

  useEffect(() => {
    const timeout = setTimeout(() => setDelayed(false), 3000);
    return () => clearTimeout(timeout);
  }, []);

  if (delayed) return;

  return (
    <group {...props}>
      {description && (
        <group position={[0, 0.5, 0]}>
          <mesh
            position={[0, 0, 0.01]}
            scale={[0.1, 0.1, 0.1]}
            onAfterRender={() => {
              setRenderDone(true);
            }}
          >
            <Text
              anchorX="center"
              anchorY="middle"
              {...fontPropsTitle}
              ref={descRef}
            >
              {description}
            </Text>
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <roundedPlaneGeometry args={[descWidth, descHeight, 0.07]} />
            <meshStandardMaterial
              attach="material"
              color={backgroundColor}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <roundedPlaneGeometry
              args={[
                descWidth + descBorderWidth,
                descHeight + descBorderWidth,
                0.07 + descBorderWidth / 2,
              ]}
            />
            <meshStandardMaterial
              attach="material"
              color={color ? new Color(color) : accentColor}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.005]}>
            <roundedPlaneGeometry args={[descWidth, descHeight, 0.07]} />
            <meshStandardMaterial
              attach="material"
              color={backgroundColor}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.01]} scale={[-0.1, 0.1, 0.1]}>
            <Text
              anchorX="center"
              anchorY="middle"
              {...fontPropsTitle}
              ref={descRef}
            >
              {description}
            </Text>
          </mesh>
        </group>
      )}
      <mesh>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial
          attach="material"
          color={color ? new Color(color) : accentColor}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export default RoomCenter;
