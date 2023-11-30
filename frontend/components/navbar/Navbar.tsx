"use client";
import React from "react";
import { MainNav } from "@/components/navbar/MainNav";
import { UserNav } from "@/components/navbar/UserNav";

export function Navbar() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}
