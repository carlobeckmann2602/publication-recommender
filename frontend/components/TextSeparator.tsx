import React from "react";

import { Separator } from "@/components/ui/separator";

interface Props {
  children: string;
}

function TextSeparator({ children }: Props) {
  return (
    <div className="flex flex-row m-8 items-center">
      <Separator className="flex-grow w-auto" />
      <p className="mx-4">{children}</p>
      <Separator className="flex-grow w-auto" />
    </div>
  );
}

export default TextSeparator;
