"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLazyQuery, useMutation } from "@apollo/client";
import { MarkAsFavoriteDocument } from "@/graphql/mutation/MarkAsFavorite.generated";
import { UnmarkAsFavoriteDocument } from "@/graphql/mutation/UnmarkAsFavorite.generated";
import { Heart } from "lucide-react";
import { GetFavoritesIdsDocument } from "@/graphql/queries/GetFavoritesIds.generated";
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
  title?: string;
  enableWarning?: boolean;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const session = useSession();

  const [getFavorites, { data }] = useLazyQuery(GetFavoritesIdsDocument, {
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
      refetchQueries: [GetFavoritesIdsDocument],
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
      refetchQueries: [GetFavoritesIdsDocument],
    }
  );

  const changeLike = async () => {
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
  };

  const onLiked = async () => {
    if (session.status == "authenticated") {
      changeLike();
    } else {
      router.push("/signup", { scroll: false });
    }
  };

  if (props.enableWarning) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            {liked ? (
              <Heart size={24} color="red" fill="red" />
            ) : (
              <Heart size={24} />
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="leading-normal">
              Do you really want to remove the publication{" "}
              <i>
                &quot;
                {props.title}
                &quot;
              </i>
              {"  "}
              from your favourites?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose className="w-1/2" asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="w-1/2"
              type="submit"
              onClick={() => changeLike()}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button variant="ghost" size="icon" onClick={onLiked}>
      {liked ? <Heart size={24} color="red" fill="red" /> : <Heart size={24} />}
    </Button>
  );
}
