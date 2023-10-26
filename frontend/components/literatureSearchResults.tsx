import React from "react";
//import { fetchSearchData } from "@/app/api/fetchSearchData";
import { getClient } from "@/lib/client";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";

interface Props {
  query: string | undefined;
  offset: number | undefined;
}

export default async function LiteratureSearchResults({
  query,
  offset,
}: Props) {
  //const data = await fetchSearchData(query, offset);
  const data = await getClient().query({
    query: GetSearchResultsDocument,
    variables: { query: query },
  });

  

  //return <div>{JSON.stringify(data, undefined, 2)}</div>;
  return <ApolloWrapper>{JSON.stringify(data.data.characters?.results, undefined, 2)}</ApolloWrapper>;
}
