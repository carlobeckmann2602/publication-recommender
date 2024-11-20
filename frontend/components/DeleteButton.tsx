import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onClick: () => void;
  text?: string;
  icon?: boolean;
  tooltipText?: string;
  dialogText?: string;
  dialogTitle?: string;
};

export default function DeleteButton({
  onClick,
  text,
  icon,
  tooltipText,
  dialogText,
  dialogTitle,
}: Props) {
  if (dialogText || dialogTitle) {
    return (
      <AlertDialog>
        {tooltipText ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size={text ? "default" : "icon"}
                  className={text ? "" : "aspect-square"}
                >
                  {text} {icon && <Trash2 className={text && "ml-4"} />}
                </Button>
              </AlertDialogTrigger>
            </TooltipTrigger>
            <TooltipContent sideOffset={10} align="start">
              {tooltipText}
            </TooltipContent>
          </Tooltip>
        ) : (
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size={text ? "default" : "icon"}
              className={text ? "" : "aspect-square"}
            >
              {text ?? <Trash2 />}
            </Button>
          </AlertDialogTrigger>
        )}
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="leading-normal">
              {dialogTitle}
            </AlertDialogTitle>
          </AlertDialogHeader>
          {dialogText}
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel className="w-1/2" asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction className="w-1/2" asChild>
              <Button type="submit" onClick={onClick}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
