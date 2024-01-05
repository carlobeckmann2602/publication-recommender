"use client";
import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import { getClient } from "@/lib/client";
import React from "react";
import LiteratureCard from "@/components/search/LiteratureCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DOCUMENT_TYPES } from "@/constants/enums";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

type Props = {
  id: string;
  disableSearchSimilar?: boolean;
  className?: string;
  enableRecommendationWarning?: boolean;
};

export default function LiteratureCardByIdClient({
  id,
  disableSearchSimilar,
  className,
  enableRecommendationWarning,
}: Props) {
  const { data } = useSuspenseQuery(GetPublicationDocument, {
    variables: { id: id },
  });
  return (
    <LiteratureCard
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
  );
}
