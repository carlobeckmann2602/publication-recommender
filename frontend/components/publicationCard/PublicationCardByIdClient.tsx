"use client";
import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import React, { Suspense } from "react";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES } from "@/constants/enums";
import { useSuspenseQuery } from "@apollo/client";
import PublicationCardSkeleton from "@/components/publicationCard/PublicationCardSkeleton";

type Props = {
  id: string;
  disableSearchSimilar?: boolean;
  className?: string;
};

export default function PublicationCardByIdClient({
  id,
  disableSearchSimilar,
  className,
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
        abstract={data.publication.abstract}
        documentType={DOCUMENT_TYPES.PAPER}
        disableSearchSimilar={disableSearchSimilar}
        className={className}
      />
    </Suspense>
  );
}
