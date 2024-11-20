import React from "react";
import { getClient } from "@/lib/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES, SearchStrategy } from "@/constants/enums";
import { AlertTriangle } from "lucide-react";
import {
  PublicationResponseDto, SearchFilters,
  SortStrategy,
} from "@/graphql/types.generated";
import { GetSearchResultsDocument } from "@/graphql/queries/GetSearchResults.generated";
import { GetSimilarPublicationsForPublicationWithIdDocument } from "@/graphql/queries/GetSimilarPublicationsForPublicationWithId.generated";
import _ from "lodash";
import TextSeparator from "@/components/TextSeparator";

type Props = {
  query: string;
  sortBy?: string;
  page?: number;
  amountPerPage?: number;
  filters?: SearchFilters;
  searchType?: SearchStrategy;
};

export default async function PublicationSearchResults({
  query,
  sortBy = "relevance",
  page = 0,
  amountPerPage = 10,
  filters,
  searchType = SearchStrategy.Query,
}: Props) {
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

  try {
    if (searchType === SearchStrategy.Id) {
      const responseId = await getClient().query({
        query: GetSimilarPublicationsForPublicationWithIdDocument,
        variables: {
          id: query,
          sortStrategy: sortStrategyFromString(sortBy),
          page: page,
          amountPerPage: amountPerPage,
        },
      });

      const allPublications =
          responseId.data.similarPublicationsForPublicationWithId
              .similarPublications || [];

      return (
          <>
            {allPublications.map((publication) => (
                <PublicationCard
                    key={publication.id}
                    id={publication.id}
                    title={publication.title}
                    link={publication.url}
                    authors={publication.authors}
                    date={
                      publication.publicationDate
                          ? new Date(publication.publicationDate)
                          : undefined
                    }
                    doi={publication.doi}
                    abstract={publication.abstract}
                    documentType={DOCUMENT_TYPES.PAPER}
                />
            ))}
          </>
      );
    }

    const responseId = await getClient().query({
      query: GetSearchResultsDocument,
      variables: {
        query: query,
        sortStrategy: sortStrategyFromString(sortBy),
        page: page,
        amountPerPage: amountPerPage,
        filters: filters
      },
    });

    const matchingPublications =
        responseId.data.publications.matchingPublications;
    const similarPublications =
        responseId.data.publications.similarPublications;

    return (
        <>
          {matchingPublications.map((publication) => (
              <PublicationCard
                  key={publication.id}
                  id={publication.id}
                  title={publication.title}
                  link={publication.url}
                  authors={publication.authors}
                  date={
                    publication.publicationDate
                        ? new Date(publication.publicationDate)
                        : undefined
                  }
                  doi={publication.doi}
                  abstract={publication.abstract}
                  documentType={DOCUMENT_TYPES.PAPER}
              />
          ))}
          <div className="w-full">
            {matchingPublications.length <= 0 && <TextSeparator className="my-8 text-lg font-semibold">No matching papers found, but here are some suggestions:</TextSeparator>}
            {(matchingPublications.length > 0 && matchingPublications.length < 10) &&
                <TextSeparator className="my-8 text-lg font-semibold">Papers that are similar to your search query:</TextSeparator>}
          </div>
          {similarPublications.map((publication) => (
              <PublicationCard
                  key={publication.id}
                  id={publication.id}
                  title={publication.title}
                  link={publication.url}
                  authors={publication.authors}
                  date={
                    publication.publicationDate
                        ? new Date(publication.publicationDate)
                        : undefined
                  }
                  doi={publication.doi}
                  abstract={publication.abstract}
                  documentType={DOCUMENT_TYPES.PAPER}
              />
          ))}
        </>
    )
  } catch (error: any) {
    return (
      <Alert variant="destructive" className="w-3/4 self-center">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
}
