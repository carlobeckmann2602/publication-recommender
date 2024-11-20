"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import buildSearchUrl from "@/lib/url-builder";
import { Button } from "@/components/ui/button";
import { FancyMultiSelect } from "@/components/FancyMultiSelect";
import { FilterX } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import _ from "lodash";

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
export default function SearchFilters({ query, sortBy, filters }: Props) {
  const { title, author, doi, years } = filters || {};

  const yearOptions = _.range(new Date().getFullYear(), 1970 - 1)
    .map((year) => year.toString())
    .map((year) => ({ value: year, label: year }));

  const router = useRouter();

  const [titleFilter, setTitleFilter] = useState("");
  useEffect(() => {
    setTitleFilter(title || "");
  }, [title]);
  const [authorFilter, setAuthorFilter] = useState("");
  useEffect(() => {
    setAuthorFilter(author || "");
  }, [author]);
  const [doiFilter, setDoiFilter] = useState("");
  useEffect(() => {
    setDoiFilter(doi || "");
  }, [doi]);
  const [selectedYears, setSelectedYears] = useState<
    { value: string; label: string }[]
  >([]);
  useEffect(() => {
    setSelectedYears(
      years?.map((year) => ({ value: year, label: year })) || []
    );
  }, [years]);

  function onChangeTitle(data: string) {
    setTitleFilter(data);
    router.push(
      buildSearchUrl(
        query,
        sortBy,
        data,
        authorFilter,
        doiFilter,
        selectedYears.map((year) => year.value)
      )
    );
  }
  function onChangeAuthor(data: string) {
    setAuthorFilter(data);
    router.push(
      buildSearchUrl(
        query,
        sortBy,
        titleFilter,
        data,
        doiFilter,
        selectedYears.map((year) => year.value)
      )
    );
  }
  function onChangeDoi(data: string) {
    setDoiFilter(data);
    router.push(
      buildSearchUrl(
        query,
        sortBy,
        titleFilter,
        authorFilter,
        data,
        selectedYears.map((year) => year.value)
      )
    );
  }
  function onChangeYears(data: { value: string; label: string }[]) {
    setSelectedYears(data);
    router.push(
      buildSearchUrl(
        query,
        sortBy,
        titleFilter,
        authorFilter,
        doiFilter,
        data.map((year) => year.value)
      )
    );
  }

  function clearFilters() {
    setTitleFilter("");
    setAuthorFilter("");
    setDoiFilter("");
    setSelectedYears([]);

    router.push(buildSearchUrl(query, sortBy));
  }

  return (
    <Card className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 basis-80">
      <div className="w-full flex flex-col gap-4 mb-4">
        <CardTitle className="text-lg ml-1">Filter results</CardTitle>
        <div className="grid sm:grid-cols-repeat-autofit grid-cols-1 gap-4 w-full">
          <div className="flex flex-col gap-4 w-full">
            <div>
              <Label htmlFor="title" className="ml-1">
                Title
              </Label>
              <Input
                id="title"
                placeholder={"Filter title..."}
                value={titleFilter}
                onChange={(event) => onChangeTitle(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="author" className="ml-1">
                Author
              </Label>
              <Input
                id="author"
                placeholder={"Filter author..."}
                value={authorFilter}
                onChange={(event) => onChangeAuthor(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div>
              <Label htmlFor="doi" className="ml-1">
                DOI
              </Label>
              <Input
                id="doi"
                placeholder={"Filter DOI..."}
                value={doiFilter}
                onChange={(event) => onChangeDoi(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="years" className="ml-1">
                Years
              </Label>
              <FancyMultiSelect
                id="years"
                placeholder={"Select years..."}
                options={yearOptions}
                onSelectionChange={onChangeYears}
                selected={selectedYears}
                sortSelected
              />
            </div>
          </div>
        </div>
        <div className="flex row justify-center">
          <Button onClick={clearFilters} className="w-full max-w-[20rem]">
            <FilterX className="w-4 mr-1" />
            Clear all filters
          </Button>
        </div>
      </div>
    </Card>
  );
}
