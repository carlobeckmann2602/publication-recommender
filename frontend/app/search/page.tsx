import PublicationSearchResults from "@/components/search/PublicationSearchResults";
import Pagination from "@/components/search/Pagination";
import { Searchbar } from "@/components/search/Searchbar";
import { Suspense } from "react";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";

type SearchParams = {
  searchParams: {
    q: string;
    offset: number | undefined;
  };
};

export default function Search({ searchParams }: SearchParams) {
  return (
    <div className="flex justify-center grow items-center gap-4 flex-col w-full py-4">
      <Searchbar value={searchParams.q} />
      <Suspense fallback={<SearchResultSkeleton publicationAmount={10} />}>
        <PublicationSearchResults
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
