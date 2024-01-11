"use client";
import { Header } from "@/components/Header";
import PublicationCard from "@/components/search/PublicationCard";
import { buttonVariants } from "@/components/ui/button";
import { GetFavoritesDocument } from "@/graphql/queries/GetFavorites.generated";
import { useLazyQuery } from "@apollo/client";
import { Wand2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";

export default function Favorites() {
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
      }
    };

    loadFavorites();
  }, [session, getFavorites]);

  return (
    <div className="flex flex-col">
      <Header title="Favorites" subtitle="your favourite publications" />
      <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
        {data?.favorites.map((favorite) => (
          <PublicationCard
            key={favorite.id}
            id={favorite.id}
            title={favorite.title}
            authors={favorite.authors}
            date={
              favorite.publicationDate
                ? new Date(favorite.publicationDate)
                : undefined
            }
            link={favorite.url}
            doi={favorite.doi}
            disableSearchSimilar={true}
            enableLikeWarning={true}
          />
        ))}
      </div>
      <Link
        href="/recommendation/create/new-recommendation?onFavorites=true"
        className={`${buttonVariants({
          variant: "default",
        })} fixed bottom-4 w-[370px] self-center shadow-md`}
      >
        Create Recommendation from your favorites
        <Wand2 size={20} className="ml-4" />
      </Link>
    </div>
  );
}
