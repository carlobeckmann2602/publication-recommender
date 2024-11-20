import React, { useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

type Props = {
  tooltipText?: string;
  target: "top" | "bottom";
  className?: string;
};

function ScrollToButton({ tooltipText, target, className }: Props) {
  const toTop = target === "top";
  const [isVisible, setIsVisible] = useState(toTop);

  const handleScroll = useCallback(() => {
    if (window.scrollY > 100) {
      setIsVisible(toTop);
    } else {
      setIsVisible(!toTop);
    }
  }, [toTop]);

  useEffect(() => {
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollTo = () => {
    if (!(typeof window !== "undefined")) return;
    window.scrollTo(0, toTop ? 0 : document.body.scrollHeight);
  };

  if (tooltipText)
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={"outline"}
            size={"icon"}
            onClick={scrollTo}
            className={`fixed right-4 bottom-4 z-50 ${
              !isVisible && "hidden"
            } ${className}`}
          >
            <ChevronDown />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" align="end">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );

  return (
    <Button
      variant={"outline"}
      size={"icon"}
      onClick={scrollTo}
      className={`fixed right-4 bottom-4 z-50 ${
        !isVisible && "hidden"
      } ${className}`}
    >
      <ChevronDown />
    </Button>
  );
}

export default ScrollToButton;
