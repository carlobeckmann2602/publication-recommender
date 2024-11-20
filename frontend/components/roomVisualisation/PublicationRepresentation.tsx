import { extend, Object3DNode, useFrame } from "@react-three/fiber";
import { Detailed, Text, useCursor } from "@react-three/drei";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { geometry } from "maath";
import { Color, DoubleSide, Mesh, Vector3 } from "three";
import { setTimeout } from "timers";
import PublicationRepresentationBadges from "@/components/roomVisualisation/PublicationRepresentationBadges";
import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";

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
  publicationId: string;
  name: string;
  authors?: string[] | null;
  cardWidth?: number;
  cardBorderWidth?: number;
  cardPadding?: number;
  authorAmount?: number;
  cardGap?: number;
  accent?: boolean;
};

function PublicationRepresentation({
  publicationId,
  name,
  authors,
  cardWidth = 4,
  cardBorderWidth = 0.02,
  cardPadding = 0.4,
  authorAmount = 3,
  cardGap = 1,
  accent = false,
  ...props
}: Props & JSX.IntrinsicElements["lOD"]) {
  const [isHovered, setIsHovered] = useState(false);
  useCursor(isHovered);

  const titleRef = useRef<Mesh>(null);
  const authorsTextRef = useRef<Mesh>(null);
  const badgesRef = useRef<any>(null);

  const [renderDone, setRenderDone] = useState(false);
  const [rerender, setRerender] = useState(false);

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

  const mutedForegroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 45.1%)")
    : new Color("hsl(0, 0%, 63.9%)");

  const mutedColor = isThemeLight()
    ? new Color("hsl(0, 0%, 79.1%)")
    : new Color("hsl(0, 0%, 28.9%)");

  const backgroundColor = isThemeLight()
    ? new Color("hsl(0, 0%, 100%)")
    : new Color("hsl(0, 0%, 9%)");

  const borderColor = isThemeLight()
    ? new Color("hsl(0, 0%, 76.8%)")
    : new Color("hsl(0, 0%, 24.9%)");

  const accentColor = isThemeLight()
    ? new Color("hsl(294.7, 72.4%, 39.8%)")
    : new Color("hsl(293.4, 69.5%, 48.8%)");

  const [cardHeight, setCardHeight] = useState(0.5);
  const [titleHeight, setTitleHeight] = useState(4);
  const [authorsHeight, setAuthorsHeight] = useState(1.5);

  const fontPropsTitle = {
    color: accent ? accentColor : foregroundColor,
    font: "/Inter-Bold.woff",
    fontSize: 1.7,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };
  const fontPropsAuthors = {
    color: mutedForegroundColor,
    font: "/Inter-Regular.woff",
    fontSize: 1,
    letterSpacing: -0.05,
    lineHeight: 1,
    "material-toneMapped": false,
  };

  const renderHeight = useCallback(() => {
    titleRef.current?.geometry.computeBoundingBox();
    authorsTextRef.current?.geometry.computeBoundingBox();

    if (
      titleRef.current?.geometry.boundingBox &&
      authorsTextRef.current?.geometry.boundingBox
    ) {
      const sizeTitle = new Vector3();
      titleRef.current?.geometry.boundingBox.getSize(sizeTitle);
      const sizeAuthorsText = new Vector3();
      authorsTextRef.current?.geometry.boundingBox.getSize(sizeAuthorsText);
      const sizeGroupBadges = new Vector3();

      const badges = badgesRef.current?.children[0];
      if (badges) {
        badges.geometry.computeBoundingBox();
        badges.geometry.boundingBox?.getSize(sizeGroupBadges);
      }

      const height =
        (sizeTitle.y + sizeAuthorsText.y + sizeGroupBadges.y + cardGap + 0.5) *
        0.1;

      setTitleHeight(sizeTitle.y);
      setAuthorsHeight(sizeAuthorsText.y + 0.5);
      setCardHeight(height);
    }
  }, [cardGap]);

  useEffect(() => {
    const handler = setTimeout(() => {
      renderHeight();
    }, 400);
    return () => {
      clearTimeout(handler);
    };
  }, [renderHeight, renderDone]);

  const { publicationGroups } = useFetchPublicationGroups();

  useEffect(() => {
    setRerender(true);
  }, [publicationGroups, setRerender]);

  useFrame(() => {
    if (rerender) {
      renderHeight();
      setRerender(false);
    }
  });

  let authorsString = authors?.slice(0, authorAmount).join(", ");
  if (authors && authors?.length >= authorAmount)
    authorsString = authorsString + " ...";

  return (
    <Detailed
      distances={[0, 75]}
      onPointerEnter={(event) => {
        event.stopPropagation();
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
      {...props}
    >
      <group>
        <group
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
          <mesh>
            <Text
              anchorX="left"
              anchorY="top"
              maxWidth={cardWidth * 10 - cardPadding * 10}
              {...fontPropsTitle}
              ref={titleRef}
            >
              {name}
            </Text>
            <Text
              position={[0, -1 * (titleHeight + cardGap), 0]}
              anchorX="left"
              anchorY="top"
              maxWidth={cardWidth * 10 - cardPadding * 10}
              {...fontPropsAuthors}
              ref={authorsTextRef}
            >
              {authorsString}
            </Text>
          </mesh>
          <PublicationRepresentationBadges
            id={publicationId}
            ref={badgesRef}
            position={
              new Vector3(
                0.6,
                -1 * (titleHeight + authorsHeight + 2 * cardGap),
                0
              )
            }
          />
        </group>
        <mesh position={[0, 0, 0.005]}>
          <roundedPlaneGeometry
            args={[cardWidth, cardHeight + cardPadding, 0.1]}
          />
          <meshStandardMaterial
            attach="material"
            color={isHovered ? mutedColor : backgroundColor}
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
            color={accent ? accentColor : borderColor}
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
            color={isHovered ? mutedColor : backgroundColor}
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
        <group
          position={[cardWidth / 2 - cardPadding / 2, cardHeight / 2, -0.01]}
          scale={[-0.1, 0.1, 0.1]}
        >
          <mesh>
            <Text
              anchorX="left"
              anchorY="top"
              maxWidth={cardWidth * 10 - cardPadding * 10}
              {...fontPropsTitle}
            >
              {name}
            </Text>
            <Text
              position={[0, -1 * (titleHeight + cardGap), 0]}
              anchorX="left"
              anchorY="top"
              maxWidth={cardWidth * 10 - cardPadding * 10}
              {...fontPropsAuthors}
            >
              {authorsString}
            </Text>
          </mesh>
          <PublicationRepresentationBadges
            id={publicationId}
            ref={badgesRef}
            position={
              new Vector3(
                0.6,
                -1 * (titleHeight + authorsHeight + 2 * cardGap),
                0
              )
            }
          />
        </group>
      </group>
      <group>
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
            color={
              accent ? accentColor : isHovered ? mutedColor : backgroundColor
            }
            side={DoubleSide}
            toneMapped={false}
          />
        </mesh>
      </group>
    </Detailed>
  );
}

export default PublicationRepresentation;
