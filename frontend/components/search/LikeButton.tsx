"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FullHeartIcon } from "@heroicons/react/24/solid";

type Props = {
  liked: boolean;
  id: string;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(props.liked);

  const onLiked = () => {
    setLiked((prev) => !prev);
  };

  return (
    <Button variant="ghost" size="icon" onClick={onLiked}>
      {liked ? (
        <FullHeartIcon width={24} color="red" />
      ) : (
        <HeartIcon width={24} />
      )}
    </Button>
  );
}
