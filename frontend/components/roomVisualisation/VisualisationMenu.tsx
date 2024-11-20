import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MousePointerClick,
  Move3D,
  Rotate3D,
  Search,
  Settings2,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import useOperatingSystem from "@/hooks/UseOperatingSystem";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  onResetCamera: () => void;
  onResetControlSlides: () => void;
  showGrid: boolean;
  onSwitchShowGrid: () => void;
  switchMoveRotate: boolean;
  onSwitchMoveRotate: () => void;
  searchAmount?: number;
  setSearchAmount?: (amount: number) => void;
};

export default function VisualisationMenu({
  onResetCamera,
  onResetControlSlides,
  showGrid,
  onSwitchShowGrid,
  switchMoveRotate,
  onSwitchMoveRotate,
  searchAmount,
  setSearchAmount,
}: Props) {
  useHotkeys("mod+b", () => onResetCamera());
  useHotkeys("mod+k", () => onSwitchShowGrid());
  useHotkeys("mod+i", () => onResetControlSlides());

  const { os } = useOperatingSystem();
  const modKeySymbol = os == "Mac" ? "⌘" : "strg+";

  return (
    <div className="absolute left-2 top-2 z-10">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="shadow-lg">
                <Settings2 />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">3D Room Settings</TooltipContent>
        </Tooltip>
        <DropdownMenuContent
          className="w-56 max-h-[calc(100dvh-13rem)] overflow-y-scroll"
          align="start"
          side="bottom"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>3D Room Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onResetCamera}>
              Reset Camera
              <DropdownMenuShortcut>{modKeySymbol}B</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={onSwitchShowGrid == undefined}
              onClick={onSwitchShowGrid}
            >
              {showGrid ? "Hide" : "Show"} Grid
              <DropdownMenuShortcut>{modKeySymbol}K</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSwitchMoveRotate}>
              Switch Move/Rotate
              <DropdownMenuShortcut>hold⇧</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onResetControlSlides}>
              Show Control Infos
              <DropdownMenuShortcut>{modKeySymbol}I</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {searchAmount && setSearchAmount && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Search Depth</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="min-w-[6rem]">
                      <DropdownMenuCheckboxItem
                        checked={searchAmount == 20}
                        onClick={() => setSearchAmount(20)}
                        className="justify-between"
                      >
                        20
                        <DropdownMenuShortcut className="ml-2">
                          publ.
                        </DropdownMenuShortcut>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={searchAmount == 50}
                        onClick={() => setSearchAmount(50)}
                        className="justify-between"
                      >
                        50
                        <DropdownMenuShortcut className="ml-2">
                          publ.
                        </DropdownMenuShortcut>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={searchAmount == 100}
                        onClick={() => setSearchAmount(100)}
                        className="justify-between"
                      >
                        100
                        <DropdownMenuShortcut className="ml-2">
                          publ.
                        </DropdownMenuShortcut>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={searchAmount == 250}
                        onClick={() => setSearchAmount(250)}
                        className="justify-between"
                      >
                        250
                        <DropdownMenuShortcut className="ml-2">
                          publ.
                        </DropdownMenuShortcut>
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={searchAmount == 500}
                        onClick={() => setSearchAmount(500)}
                        className="justify-between"
                      >
                        500
                        <DropdownMenuShortcut className="ml-2">
                          publ.
                        </DropdownMenuShortcut>
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>Camera Controls Infos</DropdownMenuLabel>
            <DropdownMenuItem disabled>
              Mouse Left - {switchMoveRotate ? "Rotate" : "Move"}
              <DropdownMenuShortcut>
                {switchMoveRotate ? (
                  <Rotate3D size={16} />
                ) : (
                  <Move3D size={16} />
                )}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Mouse Right - {switchMoveRotate ? "Move" : "Rotate"}
              <DropdownMenuShortcut>
                {switchMoveRotate ? (
                  <Move3D size={16} />
                ) : (
                  <Rotate3D size={16} />
                )}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Mouse Scroll - Zoom
              <DropdownMenuShortcut>
                <Search size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              Mouse Click - Card Info
              <DropdownMenuShortcut>
                <MousePointerClick size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
