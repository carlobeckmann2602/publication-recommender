import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Info, Maximize2 } from "lucide-react";

function RoomInformation() {
  return (
    <div className="absolute right-2 top-2 z-10">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" side="bottom" className="w-80">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none flex gap-4 items-center">
                <Maximize2 size={20} />
                Space = Similarity
              </h4>
              <p className="text-sm text-muted-foreground">
                The space between the publication cards is equal to the
                similarity of the content of the publications to each other.
                <br />
                <br />
                The similarity is calculated on the most important sentences and
                therefore on the content of the publication.
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default RoomInformation;
