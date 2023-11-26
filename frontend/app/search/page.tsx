import LiteratureSearchResults from "@/components/search/LiteratureSearchResults";
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
    <div className="flex justify-center grow items-center gap-4 flex-col">
      <Searchbar value={searchParams.q}></Searchbar>
      <Suspense key={searchParams.q} fallback={<div>Loading...</div>}>
        <LiteratureSearchResults
          query={searchParams.q}
          offset={searchParams.offset}
        />
      </Suspense>
    </div>
  );
}
