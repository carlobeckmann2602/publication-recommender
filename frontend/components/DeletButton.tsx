import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

type Props = {
  onClick: () => void;
  text?: string;
  tooltipText: string;
  dialogText?: string;
  dialogTitle?: string;
};

export default function DeletButton({
  onClick,
  text,
  tooltipText,
  dialogText,
  dialogTitle,
}: Props) {
  if (dialogText || dialogTitle) {
    return (
      <Dialog>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  size={text ? "default" : "icon"}
                  className={text ? "" : "aspect-square"}
                >
                  {text ?? <Trash2 />}
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent className="mx-2">{tooltipText}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="leading-normal">{dialogTitle}</DialogTitle>
          </DialogHeader>
          {dialogText}
          <DialogFooter className="sm:justify-start">
            <DialogClose className="w-1/2" asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button className="w-1/2" type="submit" onClick={onClick}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            variant="destructive"
            size={text ? "default" : "icon"}
            className={text ? "" : "aspect-square"}
          >
            {text ?? <Trash2 />}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="mx-2">{tooltipText}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
