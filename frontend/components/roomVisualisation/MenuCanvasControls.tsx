import { useBounds } from "@react-three/drei";
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useEffect,
} from "react";

type Props = {
  menuControls: {
    resetCamera: boolean;
  };
  setMenuControls: Dispatch<SetStateAction<{ resetCamera: boolean }>>;
  controlsRef: MutableRefObject<any>;
};

export default function MenuCanvasControls({
  menuControls,
  setMenuControls,
  controlsRef,
}: Props) {
  const bounds = useBounds();

  useEffect(() => {
    if (menuControls.resetCamera) {
      controlsRef.current.enableRotate = false;
      controlsRef.current.enablePan = false;
      setMenuControls({ ...menuControls, resetCamera: false });
      bounds
        .refresh()
        .moveTo([0, 0, 7])
        .lookAt({ target: [0, 0, 1] });
      setTimeout(() => {
        controlsRef.current.enableRotate = true;
        controlsRef.current.enablePan = true;
      }, 2000);
    }
  }, [menuControls, setMenuControls, bounds, controlsRef]);

  return <></>;
}
