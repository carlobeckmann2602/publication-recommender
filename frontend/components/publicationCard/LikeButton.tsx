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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import Latex from "@/lib/latex-converter";

type Props = {
  id: string;
  title?: string;
  enableWarning?: boolean;
};

export default function LikeButton(props: Props) {
  const [liked, setLiked] = useState(false);
  const router = useRouter();
  const session = useSession();

  const { toast } = useToast();

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
        } else {
          toast({
            title: "Publication added to favorites",
            description: (
              <Latex>{`Publication \"${props.title}\" added to favorites`}</Latex>
            ),
          });
        }
      } else {
        const response = await unmarkFavoriteFunction({
          variables: { id: props.id },
        });
        if (response.errors) {
          console.error(response.errors);
        } else if (!response.data?.unmarkAsFavorite) {
          console.error("Unlike failed");
        } else {
          toast({
            title: "Publication removed from favorites",
            description: (
              <Latex>{`Publication \"${props.title}\" removed from favorites`}</Latex>
            ),
            variant: "destructive",
          });
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
      router.push("/signup?origin=like", { scroll: false });
    }
  };

  if (props.enableWarning) {
    return (
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                {liked ? (
                  <Heart size={24} color="red" fill="red" />
                ) : (
                  <Heart size={24} />
                )}
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent align="start" sideOffset={10}>
            Unfavorite publication
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="leading-normal">
              {liked ? "Unfavorite publication" : "Favorite publication"}
            </DialogTitle>
          </DialogHeader>
          Do you really want to remove the publication{" "}
          <i>
            &quot;
            {props.title}
            &quot;
          </i>
          {"  "}
          from your favourites?
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
              Unfavorite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onLiked}>
          {liked ? (
            <Heart size={24} color="red" fill="red" />
          ) : (
            <Heart size={24} />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="start" sideOffset={10}>
        {liked ? "Unfavorite publication" : "Favorite publication"}
      </TooltipContent>
    </Tooltip>
  );
}
