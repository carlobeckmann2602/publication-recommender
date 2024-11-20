import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Axis3D, LayoutGrid, List } from "lucide-react";

type Props = {
  disabled?: boolean;
  disableRoom?: boolean;
};

export default function CardViewToggle({
  disabled,
  disableRoom = false,
}: Props) {
  return (
    <TabsList className="w-fit self-end">
      <Tooltip>
        <TabsTrigger value="grid" disabled={disabled} asChild>
          <TooltipTrigger>
            <LayoutGrid size={20} />
          </TooltipTrigger>
        </TabsTrigger>
        <TooltipContent sideOffset={10}>Grid View</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TabsTrigger value="list" disabled={disabled} asChild>
          <TooltipTrigger className="hidden xl:block">
            <List size={20} />
          </TooltipTrigger>
        </TabsTrigger>
        <TooltipContent sideOffset={10}>List View</TooltipContent>
      </Tooltip>
      {!disableRoom && (
        <Tooltip>
          <TabsTrigger value="room" disabled={disabled} asChild>
            <TooltipTrigger>
              <Axis3D size={20} />
            </TooltipTrigger>
          </TabsTrigger>
          <TooltipContent sideOffset={10}>Room View</TooltipContent>
        </Tooltip>
      )}
    </TabsList>
  );
}
