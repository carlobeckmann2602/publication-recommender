"use client";
import { Header } from "@/components/Header";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { Searchbar } from "@/components/search/Searchbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button, buttonVariants } from "@/components/ui/button";
import { GetRecommendationsDocument } from "@/graphql/queries/GetRecomendations.generated";
import { useLazyQuery } from "@apollo/client";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect } from "react";
import { DOCUMENT_TYPES } from "@/constants/enums";

export default function Recommendation() {
  const session = useSession();

  const [getRecommendation, { data }] = useLazyQuery(
    GetRecommendationsDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
      fetchPolicy: "cache-and-network",
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

  if (data?.recommendations.length === 0)
    return (
      <div className="flex flex-col w-full h-full">
        <Header
          title="Recommendation History"
          subtitle="find your recommendations here"
        />
        <div className="grow flex flex-col gap-4 justify-center items-center">
          <div className="text-2xl font-medium text-center w-full">
            You have no recommendations!
          </div>
          <div className="text-lg font-normal text-center w-full">
            To generate a recommendation, either create one based on your
            favourites on your favourites page or search for similar
            publications and generate a recommendation based on them.
          </div>
          <Searchbar className="my-6" />
          <Link
            href="/profile/favorites"
            className={buttonVariants({
              variant: "default",
            })}
          >
            <Heart fill="#fff" className="mr-4" size={20} /> Go to your favorite
            publications !
          </Link>
        </div>
      </div>
    );

  return (
    <div className="flex flex-col w-full">
      <Header
        title="Recommendation History"
        subtitle="find your recommendations here"
      />
      {data?.recommendations[0]?.publications && (
        <RecommendationSlider
          title="Your newest Recommendation"
          publications={data?.recommendations[0].publications}
        />
      )}
      <div className="text-2xl font-medium text-left w-full my-4">
        Older Recommendations
      </div>
      {data?.recommendations.length != undefined &&
      data?.recommendations.length >= 2 ? (
        <Accordion type="single" collapsible>
          {data?.recommendations.slice(1).map((recommendation, index) => {
            return (
              <AccordionItem
                key={recommendation.id}
                value={
                  recommendation.id
                    ? recommendation.id?.toString()
                    : index.toString()
                }
              >
                <AccordionTrigger>
                  {index + 1}. Recommendation
                  {` from ${new Date(
                    recommendation.createdAt
                  ).toLocaleDateString()}`}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
                    {recommendation.publications.map((publication) => (
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
                        documentType={DOCUMENT_TYPES.PAPER}
                        disableSearchSimilar={false}
                        className="h-full"
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="text-xl font-normal text-center w-full my-2">
          There are no older recommendations
        </div>
      )}
    </div>
  );
}
