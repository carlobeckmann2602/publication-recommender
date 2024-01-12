import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileSearch2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  id: string;
};

export default function SimilarSearchButton({ id }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={`/search/${id}`}
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <FileSearch2 width={24} />
        </Link>
      </TooltipTrigger>
      <TooltipContent>Search for similar publications</TooltipContent>
    </Tooltip>
  );
}
