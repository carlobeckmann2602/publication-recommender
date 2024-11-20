import useVisualisationStore from "@/stores/visualisationStore";
import {
  Maximize2,
  Mouse,
  MousePointerClick,
  Move3D,
  Rotate3D,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export default function ControlSlides({
  switchMoveRotate,
}: {
  switchMoveRotate: boolean;
}) {
  const { showControlSlides, switchShowControlSlides } =
    useVisualisationStore();

  const [step, setStep] = useState(0);

  const steps = [
    {
      mouseDescription: "Use Mouse Left Button",
      action: switchMoveRotate ? "to Rotate" : "to Move",
      actionIcon: switchMoveRotate ? <Rotate3D /> : <Move3D />,
    },
    {
      mouseDescription: "Use Mouse Right Button",
      action: switchMoveRotate ? "to Move" : "to Rotate",
      actionIcon: switchMoveRotate ? <Move3D /> : <Rotate3D />,
    },
    {
      mouseDescription: "Click on Card",
      action: "to get extra information",
      actionIcon: <MousePointerClick />,
    },
    {
      description: "Space between Cards",
      action: "equal to the similarity of the publications",
      actionIcon: <Maximize2 />,
    },
    {
      description: "",
      action: "",
    },
  ];

  const intervalRef = useRef<any>(null);

  const handelStart = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setStep((current) => current + 1),
      3500
    );
  }, []);

  const handleSkip = () => {
    /* clearInterval(intervalRef.current); */
    setStep((current) => current + 1);
    /* intervalRef.current = setInterval(
      () => setStep((current) => current + 1),
      3500
    ); */
  };

  const handleEnd = useCallback(() => {
    switchShowControlSlides();
    /* clearInterval(intervalRef.current); */
    setStep(0);
    /* intervalRef.current = null; */
  }, [switchShowControlSlides]);

  useEffect(() => {
    if (showControlSlides) {
      /* if (!intervalRef.current) {
        handelStart();
      } */
      if (step >= steps.length - 1) {
        handleEnd();
      }
    }
  }, [showControlSlides, step, steps.length, handelStart, handleEnd]);

  if (showControlSlides)
    if (steps[step].description) {
      return (
        <div
          className="absolute w-full h-full z-20 backdrop-blur-md flex flex-col justify-center items-center gap-2 rounded-lg"
          /* onClick={handleSkip} */
        >
          <h3 className="flex flex-row justify-center items-center gap-2 text-2xl font-medium">
            {steps[step].actionIcon}
            {steps[step].description}
          </h3>
          <div className="flex flex-row justify-center items-center gap-2 text-lg mt-4">
            {steps[step].action}
          </div>
          <Button
            onClick={handleSkip}
            variant="link"
            size="sm"
            className="mt-4"
          >
            Next
          </Button>
        </div>
      );
    } else {
      return (
        <div
          className="absolute w-full h-full z-20 backdrop-blur-md flex flex-col justify-center items-center gap-2 rounded-lg"
          /* onClick={handleSkip} */
        >
          <h3 className="flex flex-row justify-center items-center gap-2 text-2xl font-medium">
            <Mouse size={32} />
            {steps[step].mouseDescription}
          </h3>
          <div className="flex flex-row justify-center items-center gap-2 text-lg mt-4">
            {steps[step].action} {steps[step].actionIcon}
          </div>
          <Button
            onClick={handleSkip}
            variant="link"
            size="sm"
            className="mt-4"
          >
            Next
          </Button>
        </div>
      );
    }
}
