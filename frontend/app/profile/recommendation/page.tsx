"use client";
import { Header } from "@/components/Header";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
import PublicationCard from "@/components/search/PublicationCard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { GetRecommendationsDocument } from "@/graphql/queries/GetRecomendations.generated";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

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
    </div>
  );
}
