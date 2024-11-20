import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function Header({
  title,
  subtitle,
  borderColor,
}: {
  title?: string;
  subtitle?: string;
  borderColor?: string;
}) {
  return (
    <div
      className={`bg-neutral-100 dark:bg-neutral-800 rounded-md my-4 ${
        borderColor ? "border-solid border-4" : ""
      }`}
      style={{ borderColor: borderColor ? borderColor : "" }}
    >
      <div className="relative isolate px-6 pt-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-10 sm:py-18 lg:py-12">
          <div className="text-center hyphens-auto break-words">
            {/* TODO: Implement proper client-side suspense handling */}
            {title ? (
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                {title}
              </h1>
            ) : (
              <Skeleton className="bg-neutral-400 h-16 w-4/5 rounded-md mx-auto mb-6" />
            )}
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-neutral-200">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
