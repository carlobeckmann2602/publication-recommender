import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import { getClient } from "@/lib/client";
import React, { Suspense } from "react";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { DOCUMENT_TYPES } from "@/constants/enums";
import PublicationCardSkeleton from "./PublicationCardSkeleton";

type Props = {
  id: string;
  disableSearchSimilar?: boolean;
  className?: string;
};

export default async function PublicationCardByIdServer({
  id,
  disableSearchSimilar,
  className,
}: Props) {
  try {
    const { data } = await getClient().query({
      query: GetPublicationDocument,
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
        />
      </Suspense>
    );
  } catch (error: any) {
    return (
      <Alert variant="destructive" className="w-1/2 self-center">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
}
