"use client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import React, { useCallback } from "react";
import { allowBackgroundScrolling } from "@/lib/modal-controls";

export default function ModalCloseButton({
  onClose,
}: {
  onClose?: () => void;
}) {
  const router = useRouter();
  const handleCloseClick = useCallback(() => {
    allowBackgroundScrolling();

    if (onClose) {
      onClose();
      return;
    }

    router.back();
  }, [router, onClose]);

  return (
    <button
      onClick={handleCloseClick}
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}
