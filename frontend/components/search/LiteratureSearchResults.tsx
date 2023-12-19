import React from "react";
import { getClient } from "@/lib/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import LiteratureCard from "@/components/search/LiteratureCard";
import { GetSearchResultsByQueryDocument } from "@/graphql/queries/GetSearchResultsByQuery.generated";
import { SEARCH_TYPES } from "@/constants/enums";
import { GetSearchResultsByIdDocument } from "@/graphql/queries/GetSearchResultsById.generated";
import { getServerSession } from "next-auth";

type Props = {
  query: string;
  offset: number | undefined;
  searchType?: SEARCH_TYPES;
};

export default async function LiteratureSearchResults({
  query,
  offset,
  searchType,
}: Props) {
  try {
    switch (searchType) {
      case SEARCH_TYPES.ID:
        const responseId = await getClient().query({
          query: GetSearchResultsByIdDocument,
          variables: { id: query },
        });
        return (
          <>
            {responseId.data.publicationsById.map((publication) => (
              <LiteratureCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                link={publication.url ? publication.url : ""}
                authors={publication.authors}
                date={
                  publication.publicationDate
                    ? new Date(publication.publicationDate)
                    : undefined
                }
                doi={publication.doi}
              />
            ))}
          </>
        );

      default:
        const { data } = await getClient().query({
          query: GetSearchResultsByQueryDocument,
          variables: { query: query },
        });
        return (
          <>
            {data.publicationsByQuery.map((publication) => (
              <LiteratureCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                link={publication.url ? publication.url : ""}
                authors={publication.authors}
                date={
                  publication.publicationDate
                    ? new Date(publication.publicationDate)
                    : undefined
                }
                doi={publication.doi}
              />
            ))}
          </>
        );
    }
  } catch (error: any) {
    return (
      <Alert variant="destructive" className="w-1/4">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
}
