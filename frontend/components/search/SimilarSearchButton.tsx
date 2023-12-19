import React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { FileSearch2 } from "lucide-react";

type Props = {
  id: string;
};

export default function SimilarSearchButton({ id }: Props) {
  return (
    <Link
      href={`/search/${id}`}
      className={buttonVariants({ variant: "ghost", size: "icon" })}
    >
      <FileSearch2 width={24} />
    </Link>
  );
}
