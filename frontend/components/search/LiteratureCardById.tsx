import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import { getClient } from "@/lib/client";
import React from "react";
import LiteratureCard from "@/components/search/LiteratureCard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

type Props = {
  id: string;
  deactivateSearchSimilar?: boolean;
  className?: string;
};

export default async function LiteratureCardById({
  id,
  deactivateSearchSimilar,
  className,
}: Props) {
  try {
    const { data } = await getClient().query({
      query: GetPublicationDocument,
      variables: { id: id },
    });
    return (
      <LiteratureCard
        key={data.publication.id}
        id={data.publication.id}
        title={data.publication.title}
        link={data.publication.url ? data.publication.url : ""}
        authors={data.publication.authors}
        date={
          data.publication.publicationDate
            ? new Date(data.publication.publicationDate)
            : undefined
        }
        doi={data.publication.doi}
        deactivateSearchSimilar={deactivateSearchSimilar}
        className={className}
      />
    );
  } catch (error: any) {
    return (
      <Alert variant="destructive" className="w-1/4 self-center">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
}
