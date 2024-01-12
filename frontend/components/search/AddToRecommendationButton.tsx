"use client";

import useRecommendationsStore from "@/stores/recommendationsStore";
import { Button } from "../ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type Props = {
  id: string;
  title: string;
  enableWarning?: boolean;
};

export default function AddToRecommendationButton({
  id,
  title,
  enableWarning,
}: Props) {
  const { publicationGroup, addPublication, removePublication } =
    useRecommendationsStore();
  const [included, setIncluded] = useState(false);

  const add = () => {
    if (included) {
      removePublication(id);
    }
    addPublication(id);
  };

  const remove = () => {
    removePublication(id);
  };

  useEffect(() => {
    setIncluded(publicationGroup.includes(id));
  }, [publicationGroup, id]);

  if (included) {
    if (enableWarning) {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <MinusCircle />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="leading-normal">
                Remove publication from selection
              </DialogTitle>
            </DialogHeader>
            Do you really want to remove the publication{" "}
            <i>
              &quot;
              {title}
              &quot;
            </i>
            {"  "}
            from your recommendation selection?
            <DialogFooter className="sm:justify-start">
              <DialogClose className="w-1/2" asChild>
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </DialogClose>
              <Button className="w-1/2" type="submit" onClick={remove}>
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Button variant="ghost" size="icon" onClick={remove}>
        <MinusCircle />
      </Button>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={add}>
      <PlusCircle />
    </Button>
  );
}
