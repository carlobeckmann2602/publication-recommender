"use client";
import { PublicationResponseDto } from "@/graphql/types.generated";
import React, { useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Bounds, Html, MapControls } from "@react-three/drei";
import PublicationRepresentation from "@/components/roomVisualisation/PublicationRepresentation";
import { Vector3, MOUSE, TOUCH } from "three";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES, SearchStrategy } from "@/constants/enums";
import SelectToZoom from "@/components/roomVisualisation/SelectToZoom";
import VisualisationMenu from "@/components/roomVisualisation/VisualisationMenu";
import MenuCanvasControls from "@/components/roomVisualisation/MenuCanvasControls";
import ControlSlides from "@/components/roomVisualisation/ControlSlides";
import useVisualisationStore from "@/stores/visualisationStore";
import RoomGrid from "@/components/roomVisualisation/RoomGrid";
import { isHotkeyPressed } from "react-hotkeys-hook";
import Spinner from "@/components/Spinner";
import SearchTermRepresentation from "@/components/roomVisualisation/SearchTermRepresentation";
import * as _ from "lodash";
import LoadingState from "@/components/LoadingState";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";
import RoomInformation from "@/components/roomVisualisation/RoomInformation";
import RoomCenter from "@/components/roomVisualisation/RoomCenter";

type Props = {
  query?: string;
  searchPublication?: PublicationResponseDto;
  publications: PublicationResponseDto[];
  searchType?: SearchStrategy;
  searchCoordinate?: number[] | null;
  loadingStates?: boolean[];
  searchAmount?: number;
  setSearchAmount?: (amount: number) => void;
  enableLikeWarning?: boolean;
  roomCenterDesc?: string;
  groupColor?: string;
  className?: string;
};

export default function RoomScene({
  query,
  searchPublication,
  publications,
  searchType = SearchStrategy.Query,
  searchCoordinate,
  loadingStates,
  searchAmount,
  setSearchAmount,
  enableLikeWarning = false,
  roomCenterDesc,
  groupColor,
  className,
}: Props) {
  const [selectedPublicationId, setSelectedPublicationId] = useState<
    string | null
  >(null);
  const [searchPublicationSelected, setSearchPublicationSelected] =
    useState(false);

  const controlsRef = useRef<any>(null);

  const [menuCanvasControls, setMenuCanvasControls] = useState({
    resetCamera: true,
  });
  const { showGrid, switchShowGrid } = useVisualisationStore();
  const [switchMoveRotate, setSwitchMoveRotate] = useState(false);

  const { switchShowControlSlides } = useVisualisationStore();

  const [resetSelected, setResetSelected] = useState(false);

  return (
    <div
      className={`w-full h-full rounded-lg border shadow-sm relative ${className}`}
    >
      <ControlSlides switchMoveRotate={switchMoveRotate} />
      <VisualisationMenu
        onResetCamera={() => {
          setMenuCanvasControls({ ...menuCanvasControls, resetCamera: true });
        }}
        onResetControlSlides={() => {
          switchShowControlSlides();
        }}
        showGrid={showGrid}
        onSwitchShowGrid={switchShowGrid}
        switchMoveRotate={switchMoveRotate}
        onSwitchMoveRotate={() => setSwitchMoveRotate(!switchMoveRotate)}
        searchAmount={searchAmount}
        setSearchAmount={setSearchAmount}
      />
      <RoomInformation />
      <Canvas
        shadows
        camera={{ position: [0, 2, 100] }}
        onPointerMissed={(e) => {
          if (e.button === 0) {
            setSelectedPublicationId(null), setSearchPublicationSelected(false);
          }
        }}
        className="z-0 bg-neutral-100 dark:bg-neutral-800 rounded-lg !absolute"
        linear
        frameloop="demand"
      >
        <ambientLight intensity={5} />
        <MapControls
          makeDefault
          ref={controlsRef}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.8}
          mouseButtons={{
            LEFT:
              switchMoveRotate || isHotkeyPressed("shift")
                ? MOUSE.ROTATE
                : MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT:
              switchMoveRotate || isHotkeyPressed("shift")
                ? MOUSE.PAN
                : MOUSE.ROTATE,
          }}
          touches={{
            ONE:
              switchMoveRotate || isHotkeyPressed("shift")
                ? TOUCH.DOLLY_ROTATE
                : TOUCH.PAN,
            TWO:
              switchMoveRotate || isHotkeyPressed("shift")
                ? TOUCH.PAN
                : TOUCH.DOLLY_ROTATE,
          }}
          enableZoom={false}
          panSpeed={1.3}
        />
        <RoomGrid
          show={
            !loadingStates ||
            loadingStates?.every((element) => element === false)
              ? showGrid
              : false
          }
          height={(searchCoordinate ? searchCoordinate[1] : 0) * -1}
        />
        {searchType === SearchStrategy.Query && searchCoordinate && (
          <SearchTermRepresentation query={query ?? ""} />
        )}
        {searchType === SearchStrategy.Group && (
          <RoomCenter
            position={[0, 0, 7.5]}
            description={roomCenterDesc}
            color={groupColor}
          />
        )}
        <LoadingState
          loadingStates={loadingStates}
          fallback={
            <Html>
              <Spinner />
            </Html>
          }
        >
          <Bounds
            margin={1}
            interpolateFunc={(t: number) => -t * t * t + t * t + t}
            maxDuration={2}
          >
            <MenuCanvasControls
              menuControls={menuCanvasControls}
              setMenuControls={setMenuCanvasControls}
              controlsRef={controlsRef}
            />
            <SelectToZoom
              controlsRef={controlsRef}
              reset={resetSelected}
              setReset={setResetSelected}
            >
              {searchType === SearchStrategy.Id && searchPublication && (
                <PublicationRepresentation
                  publicationId={searchPublication.id}
                  name={searchPublication.title}
                  authors={searchPublication.authors}
                  onClick={() => {
                    setSelectedPublicationId(null);
                    setSearchPublicationSelected(true);
                  }}
                  accent
                />
              )}
              {publications.map((publication, index: number) => {
                if (publication.coordinate) {
                  return (
                    <PublicationRepresentation
                      publicationId={publication.id}
                      name={publication.title}
                      authors={publication.authors}
                      key={index}
                      position={
                        searchCoordinate
                          ? new Vector3(
                              publication.coordinate[0] - searchCoordinate[0],
                              publication.coordinate[1] - searchCoordinate[1],
                              publication.coordinate[2] - searchCoordinate[2]
                            )
                          : new Vector3(
                              publication.coordinate[0],
                              publication.coordinate[1],
                              publication.coordinate[2]
                            )
                      }
                      onClick={() => {
                        setSearchPublicationSelected(false);
                        setSelectedPublicationId(publication.id);
                      }}
                    />
                  );
                }
              })}
            </SelectToZoom>
          </Bounds>
        </LoadingState>
      </Canvas>
      {selectedPublicationId
        ? publications
            .filter((publication) => publication.id === selectedPublicationId)
            .map((publication) => {
              return (
                <div
                  className="absolute -bottom-[1px] -right-[1px] p-4 duration-500 backdrop-blur-sm border rounded-lg z-10 hsm:w-[calc(100%+2px)] w-1/3 hsm:h-auto h-[calc(100%+2px)]"
                  key={publication.id}
                >
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute right-2 top-2 z-20"
                    onClick={() => {
                      setSelectedPublicationId(null);
                      setResetSelected(true);
                    }}
                  >
                    <XIcon />
                  </Button>
                  <PublicationCard
                    id={publication.id}
                    title={publication.title}
                    link={publication.url}
                    authors={publication.authors}
                    date={
                      publication.publicationDate
                        ? new Date(publication.publicationDate)
                        : undefined
                    }
                    doi={publication.doi}
                    abstract={publication.abstract}
                    documentType={DOCUMENT_TYPES.PAPER}
                    enableLikeWarning={enableLikeWarning}
                    className="h-full overflow-y-auto"
                  />
                </div>
              );
            })
        : searchPublicationSelected &&
          searchPublication && (
            <div className="absolute -bottom-[1px] -right-[1px] p-4 duration-500 backdrop-blur-sm border rounded-lg z-10 hsm:w-[calc(100%+2px)] w-1/3 hsm:h-auto h-[calc(100%+2px)]">
              <Button
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 z-20"
                onClick={() => {
                  setSearchPublicationSelected(false);
                  setResetSelected(true);
                }}
              >
                <XIcon />
              </Button>
              <PublicationCard
                id={searchPublication.id}
                title={searchPublication.title}
                link={searchPublication.url}
                authors={searchPublication.authors}
                date={
                  searchPublication.publicationDate
                    ? new Date(searchPublication.publicationDate)
                    : undefined
                }
                doi={searchPublication.doi}
                abstract={searchPublication.abstract}
                documentType={DOCUMENT_TYPES.PAPER}
                className="border-2 border-fuchsia-700 dark:border-fuchsia-600 h-full overflow-y-auto"
              />
            </div>
          )}
    </div>
  );
}
