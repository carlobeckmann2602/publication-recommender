import React from "react";

import { Separator } from "@/components/ui/separator";

type Props = {
  children: string;
};

function TextSeparator({ children }: Props) {
  return (
    <div className="flex flex-row mx-8 items-center">
      <Separator className="flex-grow w-auto" />
      <p className="mx-4">{children}</p>
      <Separator className="flex-grow w-auto" />
    </div>
  );
}

export default TextSeparator;
