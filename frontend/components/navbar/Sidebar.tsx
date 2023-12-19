"use client";
import React, { ReactPropTypes } from "react";
import UserMenu from "./UserMenu";
import MainMenu from "./MainMenu";
import { Button } from "../ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";

type Props = {
  className?: string;
  props?: ReactPropTypes;
};

export default function Sidebar({ className, props }: Props) {
  const { isCollapsed, toggleSidebarcollapse } = useContext(SidebarContext);

  return (
    <aside
      className={`sticky top-0 z-50 backdrop-blur-sm flex flex-col gap-6 py-4 pl-4 pr-8 ${
        !isCollapsed && "min-w-[300px]"
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
    </aside>
  );
}
