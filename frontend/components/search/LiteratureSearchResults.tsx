import React from "react";
import { getClient } from "@/lib/client";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import LiteratureCard from "@/components/search/LiteratureCard";

type Props = {
  query: string;
  offset: number | undefined;
};

export default async function LiteratureSearchResults({
  query,
  offset,
}: Props) {
  try {
    const { data } = await getClient().query({
      query: GetSearchResultsDocument,
      variables: { query: query },
    });

    return (
      <>
        {data.publications.map((publication, index) => {
          <LiteratureCard
            id={publication.id}
            title={publication.title}
            link={publication.url ? publication.url : ""}
            authors={JSON.stringify(publication.authors)}
            date={publication.publicationDate}
          ></LiteratureCard>;
        })}
      </>
    );
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
