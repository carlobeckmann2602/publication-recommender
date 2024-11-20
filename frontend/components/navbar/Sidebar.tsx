"use client";
import React, { ReactPropTypes, useEffect, useState } from "react";
import UserMenu from "@/components/navbar/UserMenu";
import MainMenu from "@/components/navbar/MainMenu";
import RecommendationMenu from "@/components/navbar/RecommendationMenu";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useOperatingSystem from "@/hooks/UseOperatingSystem";
import useSidebarStore from "@/stores/sidebarStore";

type Props = {
  className?: string;
  props?: ReactPropTypes;
};

export default function Sidebar({ className, props }: Props) {
  const { isCollapsed, toggleSidebarCollapse, setSidebarCollapse } =
    useSidebarStore();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile } = useOperatingSystem();

  useEffect(() => {
    if (window.matchMedia("(max-width: 640px)").matches)
      setSidebarCollapse(true);
  }, [setSidebarCollapse]);

  useEffect(() => {
    setCollapsed(isCollapsed);
  }, [isCollapsed, setCollapsed]);

  function closeMenu() {
    if (isMobile && !isCollapsed) {
      toggleSidebarCollapse();
    }
  }

  return (
    <>
      <button
        className={`
        lg:hidden transition-all w-screen h-[100dvh] bg-black dark:bg-white dark:bg-opacity-20 backdrop-blur-lg bg-opacity-40 z-[49] top-0 left-0
        ${collapsed ? "hidden" : "fixed"}
      `}
        onClick={toggleSidebarCollapse}
      />

      <aside
        className={`
        fixed lg:sticky h-[100dvh] top-0 z-50 
        flex flex-col gap-6
        transition-all shadow-md border rounded-e-md
        backdrop-blur-lg bg-background
        ${
          collapsed
            ? "-translate-x-full lg:translate-x-0"
            : "w-4/5 lg:w-auto lg:min-w-[18rem] lg:max-w-none max-w-xs"
        } 
        ${className}
        `}
      >
        <Button
          variant={"outline"}
          className={`
        absolute bottom-16 lg:bottom-auto lg:top-20 h-8 w-8 p-1 rounded-full
        ${
          collapsed
            ? "lg:-right-4 -right-10 drop-shadow-md lg:drop-shadow-none"
            : "-right-4"
        }
        `}
          onClick={toggleSidebarCollapse}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </Button>

        <UserMenu clickCallback={closeMenu} isCollapsed={collapsed} />
        <MainMenu clickCallback={closeMenu} isCollapsed={collapsed} />
        <RecommendationMenu clickCallback={closeMenu} isCollapsed={collapsed} />
      </aside>
    </>
  );
}
