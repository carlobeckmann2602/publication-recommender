import { useState, useEffect } from "react";

const getOperatingSystem = (userAgent: string) => {
  if (userAgent.includes("Windows")) return "Windows";
  if (userAgent.includes("Mac")) return "Mac";
  if (userAgent.includes("Linux")) return "Linux";
  return undefined;
};

export default function useOperatingSystem() {
  const [os, setOs] = useState<string | undefined>("");
  const [isMobile, setIsMobile] = useState<boolean>();

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    setOs(getOperatingSystem(userAgent));

    setIsMobile(window.matchMedia("(max-width: 640px)").matches);
  }, []);

  return { os, isMobile };
}
