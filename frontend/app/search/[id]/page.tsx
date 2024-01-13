import TextSeparator from "@/components/TextSeparator";
import PublicationCardById from "@/components/publicationCard/PublicationCardByIdServer";
import PublicationCardSkeleton from "@/components/publicationCard/PublicationCardSkeleton";
import PublicationSearchResults from "@/components/search/PublicationSearchResults";
import Pagination from "@/components/search/Pagination";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import { Searchbar } from "@/components/search/Searchbar";
import { SEARCH_TYPES } from "@/constants/enums";
import { Suspense } from "react";

type SearchParams = {
  params: {
    id: string;
  };
  searchParams: {
    offset: number | undefined;
  };
};

export default function Search({ searchParams, params }: SearchParams) {
  return (
    <div className="flex justify-center grow items-center gap-4 flex-col w-full py-4">
      <Searchbar />

      <div className="flex flex-col gap-4 w-5/6">
        <Suspense fallback={<PublicationCardSkeleton />}>
          <PublicationCardById
            className="w-full"
            id={params.id}
            disableSearchSimilar={true}
          />
        </Suspense>
        <TextSeparator>similar paper</TextSeparator>
      </div>

      <Suspense
        key={params.id}
        fallback={<SearchResultSkeleton publicationAmount={10} />}
      >
        <PublicationSearchResults
          query={params.id}
          offset={searchParams.offset}
          searchType={SEARCH_TYPES.ID}
        />
        <Pagination
          totalResults={100}
          resultsPerPage={10}
          selectedPage={searchParams.offset ? searchParams.offset : 0}
          url={`/search/${params.id}`}
        ></Pagination>
      </Suspense>
    </div>
  );
}
