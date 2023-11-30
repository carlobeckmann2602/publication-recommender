import LiteratureSearchResults from "@/components/search/LiteratureSearchResults";
import Pagination from "@/components/search/Pagination";
import { Searchbar } from "@/components/Searchbar";
import { Suspense } from "react";

interface SearchParams {
  searchParams: {
    q: string;
    offset: number | undefined;
  };
}

export default function Search({ searchParams }: SearchParams) {
  return (
    <div className="flex justify-center grow items-center gap-4 flex-col w-full">
      <Searchbar value={searchParams.q}></Searchbar>
      <Suspense key={searchParams.q} fallback={<div>Loading...</div>}>
        <LiteratureSearchResults
          query={searchParams.q}
          offset={searchParams.offset}
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
