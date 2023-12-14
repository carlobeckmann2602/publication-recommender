import LiteratureSearchResults from "@/components/search/LiteratureSearchResults";
import Pagination from "@/components/search/Pagination";
import { Searchbar } from "@/components/search/Searchbar";
import { SEARCH_TYPES } from "@/constants/enums";
import { Suspense } from "react";

type SearchParams = {
  searchParams: {
    q: string;
    offset: number | undefined;
    searchType: SEARCH_TYPES;
  };
};

export default function Search({ searchParams }: SearchParams) {
  return (
    <div className="flex justify-center grow items-center gap-4 flex-col w-full py-4">
      <Searchbar
        value={searchParams.searchType == SEARCH_TYPES.ID ? "" : searchParams.q}
      ></Searchbar>
      <Suspense key={searchParams.q} fallback={<div>Loading...</div>}>
        <LiteratureSearchResults
          query={searchParams.q}
          offset={searchParams.offset}
          searchType={searchParams.searchType}
        />
        <Pagination
          totalResults={100}
          resultsPerPage={10}
          selectedPage={searchParams.offset ? searchParams.offset : 0}
          url={`/search?q=${searchParams.q}`}
        ></Pagination>
      </Suspense>
    </div>
  );
}
