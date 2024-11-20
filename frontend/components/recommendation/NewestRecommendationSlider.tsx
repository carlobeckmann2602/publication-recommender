"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { GetRecommendationsDocument } from "@/graphql/queries/GetRecomendations.generated";
import { useLazyQuery } from "@apollo/client";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";

type Props = {
  title: string;
  titleClassName?: string;
};

export default function NewestRecommendationSlider({
  title,
  titleClassName,
}: Props) {
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

  return (
    <>
      {data?.recommendations[0]?.publications && (
        <RecommendationSlider
          title={title}
          titleClassName={titleClassName}
          publications={data?.recommendations[0].publications}
        />
      )}
    </>
  );
}
