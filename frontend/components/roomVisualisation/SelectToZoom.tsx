import { useBounds } from "@react-three/drei";
import React, {
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Vector3 } from "three";

export default function SelectToZoom({
  children,
  controlsRef,
  reset,
  setReset,
}: {
  children: ReactNode;
  controlsRef: MutableRefObject<any>;
  reset: boolean;
  setReset: (reset: boolean) => void;
}) {
  const bounds = useBounds();

  const [prevCameraPos, setPrevCameraPos] = useState<Vector3 | undefined>();
  const [prevCameraTarget, setPrevCameraTarget] = useState<
    Vector3 | undefined
  >();
  const enableControlsTimeoutRef = useRef<NodeJS.Timeout>();

  const resetCamera = useCallback(() => {
    if (prevCameraPos && prevCameraTarget) {
      clearTimeout(enableControlsTimeoutRef.current);
      controlsRef.current.enableRotate = false;
      controlsRef.current.enablePan = false;
      bounds.refresh().to({
        position: prevCameraPos.toArray(),
        target: prevCameraTarget.toArray(),
      });
      setPrevCameraPos(undefined);
      setPrevCameraTarget(undefined);
      enableControlsTimeoutRef.current = setTimeout(() => {
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
      }, 2000);
    }
  }, [prevCameraPos, prevCameraTarget, bounds, controlsRef]);

  useEffect(() => {
    if (reset) {
      resetCamera();
      setReset(false);
    }
  }, [reset, setReset, resetCamera]);

  return (
    <>
      <group
        onClick={(e) => {
          e.stopPropagation();
          if (!prevCameraPos && !prevCameraTarget) {
            setPrevCameraPos(e.camera.position.clone());
            setPrevCameraTarget(controlsRef.current.target.clone());
          }
          clearTimeout(enableControlsTimeoutRef.current);
          controlsRef.current.enableRotate = false;
          controlsRef.current.enablePan = false;
          e.delta <= 2 && bounds.refresh(e.object).fit();
          enableControlsTimeoutRef.current = setTimeout(() => {
            controlsRef.current.enableRotate = true;
            controlsRef.current.enablePan = true;
          }, 2000);
        }}
        onPointerMissed={(e) => {
          e.stopPropagation();
          if (e.button === 0) {
            resetCamera();
          }
        }}
      >
        {children}
      </group>
    </>
  );
}
