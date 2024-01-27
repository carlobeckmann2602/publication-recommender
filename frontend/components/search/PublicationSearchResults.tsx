import React from "react";
import { getClient } from "@/lib/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES } from "@/constants/enums";
import { AlertTriangle } from "lucide-react";
import { SearchStrategy } from "@/graphql/types.generated";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";

type Props = {
  query: string;
  page?: number;
  amountPerPage?: number;
  searchType?: SearchStrategy;
};

export default async function PublicationSearchResults({
  query,
  page = 0,
  amountPerPage = 10,
  searchType = SearchStrategy.Query,
}: Props) {
  try {
    const responseId = await getClient().query({
      query: GetSearchResultsDocument,
      variables: {
        query: query,
        strategy: searchType,
        page: page,
        amountPerPage: amountPerPage,
      },
    });
    return (
      <>
        {responseId.data.publications.map((publication) => (
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
            abstract={publication.abstract}
            documentType={DOCUMENT_TYPES.PAPER}
          />
        ))}
      </>
    );
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
