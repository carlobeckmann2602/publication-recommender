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
import { useEffect, useState } from "react";

export default function RecommendationMenu({
  clickCallback,
  isCollapsed,
}: {
  clickCallback: () => void;
  isCollapsed: boolean;
}) {
  const { recommendationGroup } = useRecommendationsStore();
  const [publicationAmount, setPublicationAmount] = useState<number>();

  useEffect(() => {
    setPublicationAmount(recommendationGroup.length);
  }, [recommendationGroup]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col gap-4 w-full justify-center text-center relative pb-4 px-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              className={`${buttonVariants({
                variant: "default",
              })} flex gap-4 w-full justify-center !p-2`}
              href="/recommendation/create"
              onClick={clickCallback}
            >
              <Sparkles />
              <span className="transition-all duration-700 hidden">
                Create Recommendation
              </span>
              <Badge variant="secondary" className="absolute -top-2 right-3">
                {publicationAmount}
              </Badge>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            Create Recommendation
          </TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center text-center relative pb-4 px-6">
      <Link
        className={`${buttonVariants({
          variant: "default",
        })} w-full flex gap-4 !justify-start`}
        href="/recommendation/create"
        onClick={clickCallback}
      >
        <Sparkles />
        <span className={"transition-all duration-700"}>
          Create Recommendation
        </span>
      </Link>
      <Badge variant="secondary" className="absolute -top-2 right-3">
        {publicationAmount}
      </Badge>
    </div>
  );
}
