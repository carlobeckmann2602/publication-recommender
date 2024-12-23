import TextSeparator from "@/components/TextSeparator";
import PublicationCardById from "@/components/publicationCard/PublicationCardByIdServer";
import PublicationCardSkeleton from "@/components/publicationCard/PublicationCardSkeleton";
import PublicationSearchResults from "@/components/search/PublicationSearchResults";
import Pagination from "@/components/search/Pagination";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import { Searchbar } from "@/components/search/Searchbar";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SearchRoomVisualisation from "@/components/roomVisualisation/SearchRoomVisualisation";
import { SearchStrategy } from "@/constants/enums";
import { Axis3D, List } from "lucide-react";

type SearchParams = {
  params: {
    id: string;
  };
  searchParams: {
    offset?: string;
  };
};

export default function Search({ searchParams, params }: SearchParams) {
  const page = searchParams.offset ? parseInt(searchParams.offset) : 0;
  return (
    <div className="flex grow items-center gap-4 flex-col w-full h-full py-4">
      <Searchbar />
      <Tabs defaultValue="list" className="w-full grow flex flex-col">
        <div className="flex justify-end md:flex-row flex-col-reverse items-end md:items-center gap-2 md:gap-4">
          <TabsList>
            <TabsTrigger value="list">
              <List size={20} />{" "}
              <span className="ml-2 hidden md:block">List</span>
            </TabsTrigger>
            <TabsTrigger value="room">
              <Axis3D size={20} />{" "}
              <span className="ml-2 hidden md:block">3D Room</span>
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="list" className="rounded-lg">
          <div className="flex justify-center grow items-center gap-4 flex-col w-full">
            <div className="flex flex-col gap-4 w-5/6">
              <Suspense fallback={<PublicationCardSkeleton />}>
                <PublicationCardById
                  className="w-full"
                  id={params.id}
                  disableSearchSimilar={true}
                />
              </Suspense>
              <TextSeparator className="my-8 text-lg font-semibold">
                Similar papers:
              </TextSeparator>
            </div>

            <Suspense
              key={params.id}
              fallback={<SearchResultSkeleton publicationAmount={10} />}
            >
              <PublicationSearchResults
                query={params.id}
                page={page}
                amountPerPage={10}
                searchType={SearchStrategy.Id}
              />
              <Pagination
                totalResults={100}
                resultsPerPage={10}
                selectedPage={page}
                url={`/search/${params.id}`}
              ></Pagination>
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="room" className="!ring-0 grow md:mb-2">
          <SearchRoomVisualisation
            query={params.id}
            searchType={SearchStrategy.Id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
