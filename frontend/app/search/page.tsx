import PublicationSearchResults from "@/components/search/PublicationSearchResults";
import Pagination from "@/components/search/Pagination";
import { Searchbar } from "@/components/search/Searchbar";
import { Suspense } from "react";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import { SortBar } from "@/components/search/SortBar";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import SearchRoomVisualisation from "@/components/roomVisualisation/SearchRoomVisualisation";
import SearchFilters from "@/components/search/SearchFilters";
import buildSearchUrl from "@/lib/url-builder";

type SearchParams = {
  searchParams: {
    q: string;
    sort?: string;
    offset?: string;
    title?: string;
    author?: string;
    doi?: string;
    years?: string;
  };
};

export default function Search({ searchParams }: SearchParams) {
  const filters = {
    title: searchParams.title,
    author: searchParams.author,
    doi: searchParams.doi,
    years: searchParams.years?.split(","),
  };
  const page = searchParams.offset ? parseInt(searchParams.offset) : 0;
  const currentUrl = buildSearchUrl(
    searchParams.q,
    searchParams.sort,
    searchParams.title,
    searchParams.author,
    searchParams.doi,
    searchParams.years?.split(",")
  );

  return (
    <div className="flex grow items-center gap-4 flex-col w-full h-full py-4">
      <Searchbar value={searchParams.q} />
      <Tabs defaultValue="list" className="w-full h-full grow flex flex-col">
        <SortBar
          query={searchParams.q}
          sortBy={searchParams.sort}
          filters={filters}
        />
        <TabsContent value="list" className="rounded-lg">
          <div className="flex justify-center grow items-center xl:items-start flex-col xl:flex-row gap-4 w-full xl:sticky xl:top-20">
            <SearchFilters
              query={searchParams.q}
              sortBy={searchParams.sort}
              filters={filters}
            />
            <div className="flex justify-center items-center grow flex-col gap-4 w-full">
              <Suspense
                fallback={<SearchResultSkeleton publicationAmount={10} />}
              >
                <PublicationSearchResults
                  query={searchParams.q}
                  sortBy={searchParams.sort}
                  page={page}
                  amountPerPage={10}
                  filters={filters}
                />
                <Pagination
                  totalResults={100}
                  resultsPerPage={10}
                  selectedPage={page}
                  url={currentUrl}
                />
              </Suspense>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="room"
          className="!ring-0 grow md:mb-2 overflow-hidden"
        >
          <SearchRoomVisualisation query={searchParams.q} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
