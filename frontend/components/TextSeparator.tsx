"use client";
import React from "react";

import { Separator } from "@/components/ui/separator";

type Props = {
  children: string;
  className?: string;
};

function TextSeparator({ children, className }: Props) {
  return (
    <div className={`flex flex-row mx-0 xs:mx-8 items-center ${className}`}>
      <Separator className="flex-grow w-auto mr-1 xs:mr-4" />
      {children}
      <Separator className="flex-grow w-auto ml-1 xs:ml-4" />
    </div>
  );
}

export default TextSeparator;
