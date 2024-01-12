import React from "react";
import { getClient } from "@/lib/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { GetSearchResultsByQueryDocument } from "@/graphql/queries/GetSearchResultsByQuery.generated";
import { DOCUMENT_TYPES, SEARCH_TYPES } from "@/constants/enums";
import { GetSearchResultsByIdDocument } from "@/graphql/queries/GetSearchResultsById.generated";
import { AlertTriangle } from "lucide-react";

type Props = {
  query: string;
  offset: number | undefined;
  searchType?: SEARCH_TYPES;
};

export default async function PublicationSearchResults({
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
              <PublicationCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                link={publication.url}
                authors={publication.authors}
                date={
                  publication.publicationDate
                    ? new Date(publication.publicationDate)
                    : undefined
                }
                doi={publication.doi}
                documentType={DOCUMENT_TYPES.PAPER}
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
              <PublicationCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                link={publication.url}
                authors={publication.authors}
                date={
                  publication.publicationDate
                    ? new Date(publication.publicationDate)
                    : undefined
                }
                doi={publication.doi}
                documentType={DOCUMENT_TYPES.PAPER}
              />
            ))}
          </>
        );
    }
  } catch (error: any) {
    return (
      <Alert variant="destructive" className="w-1/2">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
}
