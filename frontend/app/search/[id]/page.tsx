import TextSeparator from "@/components/TextSeparator";
import LiteratureCardById from "@/components/search/LiteratureCardById";
import LiteratureSearchResults from "@/components/search/LiteratureSearchResults";
import Pagination from "@/components/search/Pagination";
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
        <Suspense fallback={<div>Loading...</div>}>
          <LiteratureCardById
            className="w-full"
            id={params.id}
            deactivateSearchSimilar={true}
          />
        </Suspense>
        <TextSeparator>similar paper</TextSeparator>
      </div>

      <Suspense key={params.id} fallback={<div>Loading...</div>}>
        <LiteratureSearchResults
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
