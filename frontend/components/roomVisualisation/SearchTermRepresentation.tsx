import { extend, Object3DNode } from "@react-three/fiber";
import { Detailed, Svg, Text } from "@react-three/drei";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { geometry } from "maath";
import { Color, DoubleSide, Mesh, MeshBasicMaterial, Vector3 } from "three";
import { setTimeout } from "timers";

extend(geometry);

declare module "@react-three/fiber" {
  interface ThreeElements {
    roundedPlaneGeometry: Object3DNode<
      geometry.RoundedPlaneGeometry,
      typeof geometry.RoundedPlaneGeometry
    >;
  }
}

type Props = {
  query: string;
  cardWidth?: number;
  cardBorderWidth?: number;
  cardPadding?: number;
};

function SearchTermRepresentation({
  query,
  cardWidth = 5,
  cardBorderWidth = 0.02,
  cardPadding = 0.25,
  ...props
}: Props & JSX.IntrinsicElements["lOD"]) {
  const titleRef = useRef<Mesh>(null);

  const [renderDone, setRenderDone] = useState(false);

  const { theme, resolvedTheme } = useTheme();

  const isThemeLight = () => {
    if (theme == "light" || (theme == "system" && resolvedTheme == "light"))
      return true;
    if (theme == "dark" || (theme == "system" && resolvedTheme == "dark"))
      return false;
    return;
  };

  const foregroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 3.9%)")
    : new Color("hsl(0, 0%, 98%)");

  const mutedColor = isThemeLight()
    ? new Color("hsl(0, 0%, 79.1%)")
    : new Color("hsl(0, 0%, 28.9%)");

  const backgroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 100%)")
    : new Color("hsl(0, 0%, 9%)");

  const accentColor = isThemeLight()
    ? new Color("hsl(294.7, 72.4%, 39.8%)")
    : new Color("hsl(293.4, 69.5%, 48.8%)");

  const [cardHeight, setCardHeight] = useState(0.5);

  const fontPropsTitle = {
    color: foregroundColor,
    font: "/Inter-Regular.woff",
    fontSize: 1.7,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      titleRef.current?.geometry.computeBoundingBox();

      if (titleRef.current?.geometry.boundingBox) {
        const sizeTitle = new Vector3();
        titleRef.current?.geometry.boundingBox.getSize(sizeTitle);

        const height = sizeTitle.y * 0.1;
        setCardHeight(height);
      }
    }, 200);
    return () => {
      clearTimeout(handler);
    };
  }, [renderDone, titleRef.current?.geometry.boundingBox]);

  return (
    <Detailed distances={[0, 50]} {...props}>
      <group>
        <mesh
          position={[
            (-1 * cardWidth) / 2 + cardPadding / 2,
            cardHeight / 2,
            0.01,
          ]}
          scale={[0.1, 0.1, 0.1]}
          onAfterRender={() => {
            setRenderDone(true);
          }}
        >
          <Text
            anchorX="left"
            anchorY="top"
            maxWidth={
              cardWidth * 10 -
              cardPadding * 10 -
              (cardHeight + cardPadding * 2) * 10
            }
            {...fontPropsTitle}
            ref={titleRef}
          >
            {query}
          </Text>
        </mesh>
        <group
          position={[cardWidth / 2 - (cardHeight + cardPadding) / 2, 0, 0.01]}
        >
          <Svg
            position={[-0.12, 0.12, 0.001]}
            scale={[0.01, 0.01, 0.01]}
            strokeMaterial={
              new MeshBasicMaterial({
                color: accentColor,
                side: DoubleSide,
              })
            }
            src='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-check"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
          />
          <mesh>
            <roundedPlaneGeometry
              args={[cardHeight + cardPadding, cardHeight + cardPadding, 0.1]}
            />
            <meshStandardMaterial
              attach="material"
              color={mutedColor}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
        <mesh position={[0, 0, 0.005]}>
          <roundedPlaneGeometry
            args={[cardWidth, cardHeight + cardPadding, 0.1]}
          />
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
              cardWidth + cardBorderWidth,
              cardHeight + cardPadding + cardBorderWidth,
              0.1 + cardBorderWidth / 2,
            ]}
          />
          <meshStandardMaterial
            attach="material"
            color={accentColor}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0, -0.005]}>
          <roundedPlaneGeometry
            args={[cardWidth, cardHeight + cardPadding, 0.1]}
          />
          <meshStandardMaterial
            attach="material"
            color={backgroundColor}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <group
          position={[
            cardWidth * -0.5 + (cardHeight + cardPadding) / 2,
            0,
            -0.01,
          ]}
        >
          <Svg
            position={[0.12, 0.12, -0.005]}
            scale={[-0.01, 0.01, 0.01]}
            strokeMaterial={
              new MeshBasicMaterial({ color: accentColor, side: DoubleSide })
            }
            src='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-check"><path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>'
          />
          <mesh>
            <roundedPlaneGeometry
              args={[cardHeight + cardPadding, cardHeight + cardPadding, 0.1]}
            />
            <meshStandardMaterial
              attach="material"
              color={mutedColor}
              side={DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
        <mesh
          position={[cardWidth / 2 - cardPadding / 2, cardHeight / 2, -0.01]}
          scale={[-0.1, 0.1, 0.1]}
        >
          <Text
            anchorX="left"
            anchorY="top"
            maxWidth={
              cardWidth * 10 -
              cardPadding * 10 -
              (cardHeight + cardPadding * 2) * 10
            }
            {...fontPropsTitle}
          >
            {query}
          </Text>
        </mesh>
      </group>
      <mesh position={[0, 0, 0]}>
        <roundedPlaneGeometry
          args={[
            cardWidth + cardBorderWidth,
            cardHeight + cardPadding + cardBorderWidth,
            0.1 + cardBorderWidth / 2,
          ]}
        />
        <meshStandardMaterial
          attach="material"
          color={accentColor}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </Detailed>
  );
}

export default SearchTermRepresentation;
