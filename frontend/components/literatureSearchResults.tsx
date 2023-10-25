import React from "react";
import { fetchSearchData } from "@/app/api/fetchSearchData";

interface Props {
  query: string | undefined;
  offset: number | undefined;
}

export default async function LiteratureSearchResults({
  query,
  offset,
}: Props) {
  const data = await fetchSearchData(query, offset);

  return <div>{JSON.stringify(data, undefined, 2)}</div>;
}
