"use client";
import { Header } from "@/components/Header";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
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
    </div>
  );
}
