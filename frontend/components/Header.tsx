import React from "react";

export function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="bg-neutral-100 rounded-md my-4">
      <div className="relative isolate px-6 pt-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-10 sm:py-18 lg:py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
