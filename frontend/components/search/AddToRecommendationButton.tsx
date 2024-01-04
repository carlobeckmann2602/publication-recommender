"use client";

import useRecommendationsStore from "@/stores/recommendationsStore";
import { Button } from "../ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  id: string;
};

export default function AddToRecommendationButton({ id }: Props) {
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
