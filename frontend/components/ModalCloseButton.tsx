"use client";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import React, { useCallback } from "react";

export default function ModalCloseButton() {
  const router = useRouter();
  const onExit = useCallback(() => {
    if (typeof window != "undefined" && window.document) {
      document.body.style.overflow = "unset";
    }
    router.back();
  }, [router]);
  return (
    <button
      onClick={onExit}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
