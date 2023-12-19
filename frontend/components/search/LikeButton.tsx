"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLazyQuery, useMutation } from "@apollo/client";
import { MarkAsFavoriteDocument } from "@/graphql/mutation/MarkAsFavorite.generated";
import { UnmarkAsFavoriteDocument } from "@/graphql/mutation/UnmarkAsFavorite.generated";
import { GetFavoritesDocument } from "@/graphql/queries/GetFavorites.generated";
import { Heart } from "lucide-react";

type Props = {
  id: string;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const session = useSession();

  const [getFavorites, { data }] = useLazyQuery(GetFavoritesDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  useEffect(() => {
    const loadFavorites = async () => {
      if (session.status === "authenticated") {
        await getFavorites();

        if (
          data?.favorites.find((element) => {
            return element.id === props.id;
          })
        ) {
          setLiked(true);
        }
      }
    };

    loadFavorites();
  }, [session, data?.favorites, getFavorites, props.id]);

  const [markFavoriteFunction, { error: markFavoriteError }] = useMutation(
    MarkAsFavoriteDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
      refetchQueries: [GetFavoritesDocument],
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
      refetchQueries: [GetFavoritesDocument],
    }
  );

  const onLiked = async () => {
    if (session.status == "authenticated") {
      try {
        if (!liked) {
          const response = await markFavoriteFunction({
            variables: { id: props.id },
          });
          if (response.errors) {
            console.error(response.errors);
          } else if (!response.data?.markAsFavorite) {
            console.error("Like failed");
          }
        } else {
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
      {liked ? <Heart size={24} color="red" fill="red" /> : <Heart size={24} />}
    </Button>
  );
}
