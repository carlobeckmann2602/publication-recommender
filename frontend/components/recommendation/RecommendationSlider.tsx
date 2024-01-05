"use client";
import React, { useEffect } from "react";
import PublicationCard from "@/components/search/PublicationCard";
import { useSession } from "next-auth/react";
import { useLazyQuery } from "@apollo/client";
import { GetRecommendationsDocument } from "@/graphql/queries/GetRecomendations.generated";

/* const dummyData = {
  id: "1",
  title: "Natural language processing: an introduction",
  authors: ["Prakash M Nadkarni", "Lucila Ohno-Machado", "Wendy W Chapman"],
  date: new Date(2020),
  link: "http://localhost:3000/",
  abstract:
    "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.",
  doi: ["5756-0123.23"],
  disableSearchSimilar: false,
}; */

type Props = {
  title: string;
};

export default function RecommendationSlider({ title }: Props) {
  const session = useSession();

  const [getRecommendation, { data }] = useLazyQuery(
    GetRecommendationsDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );

  useEffect(() => {
    const loadRecommendation = async () => {
      if (session.status === "authenticated") {
        await getRecommendation();
      }
    };

    loadRecommendation();
  }, [session, getRecommendation]);

  if (session.status === "authenticated" && data?.recommendations[0]) {
    return (
      <div className="relative">
        <div className="text-2xl font-medium text-left w-full mt-4">
          {title}
        </div>
        <div className="grid gap-4 grid-cols-1 py-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {data?.recommendations[0].publications.map((publication) => (
            <PublicationCard
              key={publication.id}
              id={publication.id}
              title={publication.title}
              authors={publication.authors}
              date={
                publication.publicationDate
                  ? new Date(publication.publicationDate)
                  : undefined
              }
              link={publication.url}
              doi={publication.doi}
              disableSearchSimilar={false}
            />
          ))}
          {/* <PublicationCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
          />
          <PublicationCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
          />
          <PublicationCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
          />
          <PublicationCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
          />
          <PublicationCard
            id={dummyData.id}
            title={dummyData.title}
            authors={dummyData.authors}
            date={dummyData.date}
            link={dummyData.link}
            doi={dummyData.doi}
            disableSearchSimilar={dummyData.disableSearchSimilar}
          /> */}
        </div>
      </div>
    );
  }

  return null;
}
