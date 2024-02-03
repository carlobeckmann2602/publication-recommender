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
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

type Props = {
  onClick: () => void;
  text?: string;
  tooltipText?: string;
  dialogText?: string;
  dialogTitle?: string;
};

export default function DeleteButton({
  onClick,
  text,
  tooltipText,
  dialogText,
  dialogTitle,
}: Props) {
  if (dialogText || dialogTitle) {
    return (
      <Dialog>
        {tooltipText ? (
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
            <TooltipContent sideOffset={10} align="start">
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        ) : (
          <DialogTrigger asChild>
            <Button
              variant="destructive"
              size={text ? "default" : "icon"}
              className={text ? "" : "aspect-square"}
            >
              {text ?? <Trash2 />}
            </Button>
          </DialogTrigger>
        )}
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
            <DialogClose className="w-1/2" asChild>
              <Button type="submit" onClick={onClick}>
                Delete
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (tooltipText) {
    return (
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
        <TooltipContent sideOffset={10} align="start">
          {tooltipText}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Button
      onClick={onClick}
      variant="destructive"
      size={text ? "default" : "icon"}
      className={text ? "" : "aspect-square"}
    >
      {text ?? <Trash2 />}
    </Button>
  );
}
