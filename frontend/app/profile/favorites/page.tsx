"use client";
import { Header } from "@/components/Header";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
import LiteratureCard from "@/components/search/LiteratureCard";
import { GetFavoritesDocument } from "@/graphql/queries/GetFavorites.generated";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
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
    <div>
      <Header title="Favorites" subtitle="your favourite literature" />
      <div className="grid gap-4 grid-cols-1 py-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {data?.favorites.map((favorite) => (
          <LiteratureCard
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
      <RecommendationSlider title="Literature you might enjoy" />
    </div>
  );
}
