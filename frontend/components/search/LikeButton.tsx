"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FullHeartIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Props = {
  liked: boolean;
  id: string;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(props.liked);
  const router = useRouter();

  const onLiked = () => {
    if (session.status == "authenticated") {
      setLiked((prev) => !prev);
    } else {
      router.push("/signup", { scroll: false });
    }
  };

  const session = useSession();

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
