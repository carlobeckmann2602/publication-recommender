"use client";
import React, { ReactPropTypes, useEffect } from "react";
import UserMenu from "@/components/navbar/UserMenu";
import MainMenu from "@/components/navbar/MainMenu";
import RecommendationMenu from "@/components/navbar/RecommendationMenu";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";

type Props = {
  className?: string;
  props?: ReactPropTypes;
};

export default function Sidebar({ className, props }: Props) {
  const { isCollapsed, toggleSidebarcollapse } = useContext(SidebarContext);

  useEffect(() => {
    const content = document.getElementById("content");
    if (isCollapsed) {
      content?.classList.add("!pl-[8.5rem]", "md:!pl-36", "lg:!pl-40"); //"pl-[8.5rem]", "md:pl-36", "lg:pl-40"
    } else {
      content?.classList.remove("!pl-[8.5rem]", "md:!pl-36", "lg:!pl-40");
    }
  }, [isCollapsed]);

  return (
    <aside
      className={`fixed transition-all duration-700 top-0 z-50 backdrop-blur-sm flex flex-col gap-6 py-4 px-6 w-28 ${
        !isCollapsed && "min-w-[18rem]"
      } h-screen shadow-md border rounded-e-md ${className}`}
    >
      <Button
        variant={"outline"}
        className="absolute top-10 -right-4 h-8 w-8 p-1 rounded-full"
        onClick={toggleSidebarcollapse}
      >
        {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </Button>
      <UserMenu />
      <MainMenu />
      <RecommendationMenu />
    </aside>
  );
}
