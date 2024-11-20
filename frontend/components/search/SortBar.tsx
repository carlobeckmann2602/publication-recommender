"use client";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SortStrategy } from "@/graphql/types.generated";
import { useEffect, useState } from "react";
import buildSearchUrl from "@/lib/url-builder";
import { Axis3D, List } from "lucide-react";
import useOperatingSystem from "@/hooks/UseOperatingSystem";

const DEFAULT_SORT_STRATEGY = SortStrategy.Relevance;

type Props = {
  query?: string;
  sortBy?: string;
  filters?: {
    title?: string;
    author?: string;
    doi?: string;
    years?: string[];
  };
};
export function SortBar({ query, sortBy, filters }: Props) {
  const { title, author, doi, years } = filters || {};

  const router = useRouter();
  const { isMobile } = useOperatingSystem();

  function onChange(data: SortStrategy) {
    setSortStrategy(data);

    const newUrl = buildSearchUrl(
      query,
      sortStrategyToString(data),
      title,
      author,
      doi,
      years
    );
    router.push(newUrl);
  }

  const sortStrategyToString = (strategy: SortStrategy) => {
    switch (strategy) {
      case SortStrategy.Newest:
        return "newest";
      case SortStrategy.Oldest:
        return "oldest";
      case SortStrategy.AToZ:
        return "a-to-z";
      case SortStrategy.ZToA:
        return "z-to-a";
      case SortStrategy.Relevance:
      default:
        return "relevance";
    }
  };

  const sortStrategyFromString = (s: string) => {
    switch (s) {
      case "newest":
        return SortStrategy.Newest;
      case "oldest":
        return SortStrategy.Oldest;
      case "a-to-z":
        return SortStrategy.AToZ;
      case "z-to-a":
        return SortStrategy.ZToA;
      case "relevance":
      default:
        return SortStrategy.Relevance;
    }
  };

  const [sortStrategy, setSortStrategy] = useState(
    sortBy ? sortStrategyFromString(sortBy) : DEFAULT_SORT_STRATEGY
  );
  useEffect(() => {
    setSortStrategy(DEFAULT_SORT_STRATEGY);
  }, [query]);
  useEffect(() => {
    setSortStrategy(
      sortBy ? sortStrategyFromString(sortBy) : DEFAULT_SORT_STRATEGY
    );
  }, [sortBy]);
  const [tab, setTab] = useState("list");

  return (
    <div className="flex flex-row justify-between md:justify-end items-center gap-2 md:gap-4">
      {tab != "room" ? (
        <SelectGroup className={`flex justify-end items-center`}>
          <SelectLabel className="pl-0 md:pl-8">Sort by</SelectLabel>
          <Select onValueChange={onChange} value={sortStrategy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SortStrategy.Relevance}>Relevance</SelectItem>
              <SelectItem value={SortStrategy.Newest}>Newest</SelectItem>
              <SelectItem value={SortStrategy.Oldest}>Oldest</SelectItem>
              <SelectItem value={SortStrategy.AToZ}>A to Z</SelectItem>
              <SelectItem value={SortStrategy.ZToA}>Z to A</SelectItem>
            </SelectContent>
          </Select>
        </SelectGroup>
      ) : (
        <div />
      )}
      <TabsList>
        <TabsTrigger value="list" onClick={() => setTab("list")}>
          <List size={20} /> <span className="ml-2 hidden md:block">List</span>
        </TabsTrigger>
        <TabsTrigger value="room" onClick={() => setTab("room")}>
          <Axis3D size={20} />{" "}
          <span className="ml-2 hidden md:block">3D Room</span>
        </TabsTrigger>
      </TabsList>
    </div>
  );
}
