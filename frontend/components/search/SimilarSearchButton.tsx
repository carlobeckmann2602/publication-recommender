import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline";

type Props = {
  id: string;
};

export default function SimilarSearchButton({ id }: Props) {
  return (
    <Link
      href={`/search?q=${id}&searchType=id`}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <ClipboardDocumentIcon width={24} />
    </Link>
  );
}
