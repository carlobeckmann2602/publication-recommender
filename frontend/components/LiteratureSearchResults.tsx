import React from "react";
import { getClient } from "@/lib/client";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";
import { ApolloWrapper } from "@/lib/apollo-wrapper";

interface Props {
  query: string | undefined;
  offset: number | undefined;
}

export default async function LiteratureSearchResults({
  query,
  offset,
}: Props) {
  const { data, loading } = await getClient().query({
    query: GetSearchResultsDocument,
    variables: { query: query },
  });

  console.log(JSON.stringify(data));

  return <div>{JSON.stringify(data, undefined, 2)}</div>;
}
