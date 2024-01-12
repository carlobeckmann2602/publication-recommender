"use client";
import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import React, { Suspense } from "react";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES } from "@/constants/enums";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import PublicationCardSkeleton from "./PublicationCardSkeleton";

type Props = {
  id: string;
  disableSearchSimilar?: boolean;
  className?: string;
  enableRecommendationWarning?: boolean;
};

export default function PublicationCardByIdClient({
  id,
  disableSearchSimilar,
  className,
  enableRecommendationWarning,
}: Props) {
  const { data } = useSuspenseQuery(GetPublicationDocument, {
    variables: { id: id },
  });
  return (
    <Suspense fallback={<PublicationCardSkeleton />}>
      <PublicationCard
        key={data.publication.id}
        id={data.publication.id}
        title={data.publication.title}
        link={data.publication.url}
        authors={data.publication.authors}
        date={
          data.publication.publicationDate
            ? new Date(data.publication.publicationDate)
            : undefined
        }
        doi={data.publication.doi}
        documentType={DOCUMENT_TYPES.PAPER}
        disableSearchSimilar={disableSearchSimilar}
        className={className}
        enableRecommendationWarning={enableRecommendationWarning}
      />
    </Suspense>
  );
}
