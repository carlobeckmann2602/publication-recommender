"use client";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

export default function RecommendationMenu() {
  const { isCollapsed } = useContext(SidebarContext);
  const { publicationGroup } = useRecommendationsStore();
  const [publicationAmount, setPublicationAmount] = useState<number>();

  useEffect(() => {
    setPublicationAmount(publicationGroup.length);
  }, [publicationGroup]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-4 w-full justify-center text-center relative">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={`${buttonVariants({
                variant: "default",
              })} flex gap-4 w-full justify-center !p-2`}
              href="/recommendation/create"
            >
              <Sparkles />
              <span className="transition-all duration-700 hidden">
                Create Recommendation
              </span>
            </Link>
          </TooltipTrigger>
          <Badge variant="secondary" className="absolute -top-2 -right-2">
            {publicationAmount}
          </Badge>
          <TooltipContent side="right" sideOffset={10}>
            Create Recommendation
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center text-center relative">
      <Link
        className={`${buttonVariants({
          variant: "default",
        })} w-full flex gap-4 !justify-start`}
        href="/recommendation/create"
      >
        <Sparkles />
        <span className={"transition-all duration-700"}>
          Create Recommendation
        </span>
      </Link>
      <Badge variant="secondary" className="absolute -top-2 -right-2">
        {publicationAmount}
      </Badge>
    </div>
  );
}
