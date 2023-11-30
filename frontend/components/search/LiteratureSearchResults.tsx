import React from "react";
import { getClient } from "@/lib/client";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import LiteratureCard from "@/components/search/LiteratureCard";

interface Props {
  query: string | undefined;
  offset: number | undefined;
}

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
            title={publication.title}
            link=""
            authors={JSON.stringify(publication.authors)}
            abstract={publication.abstract}
            date={publication.date}
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
