"use client";
import React from "react";

import { Separator } from "@/components/ui/separator";

type Props = {
  children: string;
  className?: string;
};

function TextSeparator({ children, className }: Props) {
  return (
    <div className={`flex flex-row mx-8 items-center ${className}`}>
      <Separator className="flex-grow w-auto" />
      <p className="mx-4">{children}</p>
      <Separator className="flex-grow w-auto" />
    </div>
  );
}

export default TextSeparator;
