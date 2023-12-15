"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as FullHeartIcon } from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { MarkAsFavoriteDocument } from "@/graphql/mutation/MarkAsFavorite.generated";
import { UnmarkAsFavoriteDocument } from "@/graphql/mutation/UnmarkAsFavorite.generated";

type Props = {
  liked: boolean;
  id: string;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(props.liked);
  const router = useRouter();
  const session = useSession();

  const [markFavoriteFunction, { error: markFavoriteError }] = useMutation(
    MarkAsFavoriteDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );
  const [unmarkFavoriteFunction, { error: unmarkFavoriteError }] = useMutation(
    UnmarkAsFavoriteDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );

  const onLiked = async () => {
    if (session.status == "authenticated") {
      try {
        console.log(`Like State: ${liked}`);
        if (!liked) {
          console.log("Like");
          const response = await markFavoriteFunction({
            variables: { id: props.id },
          });
          if (response.errors) {
            console.error(response.errors);
          } else if (!response.data?.markAsFavorite) {
            console.error("Like failed");
          }
        } else {
          console.log("Unlike");
          const response = await unmarkFavoriteFunction({
            variables: { id: props.id },
          });
          if (response.errors) {
            console.error(response.errors);
          } else if (!response.data?.unmarkAsFavorite) {
            console.error("Unlike failed");
          }
        }
        setLiked((prev) => !prev);
      } catch (error: any) {
        console.error(error.message);
      }
    } else {
      router.push("/signup", { scroll: false });
    }
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
