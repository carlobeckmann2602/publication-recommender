"use client";
import { Header } from "@/components/Header";
import LiteratureCard from "@/components/search/LiteratureCard";
import { GetFavoritesDocument } from "@/graphql/queries/GetFavorites.generated";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const dummyData = {
  id: "1",
  title: "Natural language processing: an introduction",
  authors: ["Prakash M Nadkarni", "Lucila Ohno-Machado", "Wendy W Chapman"],
  date: new Date(2020),
  link: "http://localhost:3000/",
  abstract:
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
  doi: ["5756-0123.23"],
  disableSearchSimilar: true,
};

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
            link={favorite.url ? favorite.url : ""}
            doi={favorite.doi}
            disableSearchSimilar={true}
            enableLikeWarning={true}
          />
        ))}
      </div>
      <div className="">
        <div className="text-2xl font-medium text-left w-full mt-4">
          Literature you might enjoy
        </div>
        <div className="flex flex-row flex-nowrap gap-4 py-4 overflow-auto w-80">
          <LiteratureCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
            className="min-w-[250px]"
          />
          <LiteratureCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
            className="min-w-[250px]"
          />
          <LiteratureCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
            className="min-w-[250px]"
          />
          {/*<LiteratureCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
            className="!w-[20rem]"
          />
          <LiteratureCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
            className="!w-[20rem]"
          /> */}
        </div>
      </div>
    </div>
  );
}
