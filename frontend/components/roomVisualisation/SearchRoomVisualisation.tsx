"use client";
import { PublicationResponseDto } from "@/graphql/types.generated";
import React, { useEffect, useState } from "react";
import { GetSearchResultsCoordinatesDocument } from "@/graphql/queries/GetSearchResultsCoordinates.generated";
import { useLazyQuery } from "@apollo/client";
import { SearchStrategy } from "@/constants/enums";
import { GetPublicationDocument } from "@/graphql/queries/GetPublication.generated";
import * as _ from "lodash";
import { GetSimilarPublicationsForPublicationWithIdCoordinatesDocument } from "@/graphql/queries/GetSimilarPublicationsForPublicationWithIdCoordinates.generated";
import buildSearchUrl from "@/lib/url-builder";
import { useRouter } from "next/navigation";
import RoomScene from "@/components/roomVisualisation/RoomScene";

type Props = {
  query: string;
  page?: number;
  amountPerPage?: number;
  searchType?: SearchStrategy;
};

export default function SearchRoomVisualisation({
  query,
  page = 0,
  amountPerPage = 50,
  searchType = SearchStrategy.Query,
}: Props) {
  const router = useRouter();
  if (searchType === SearchStrategy.Query) {
    router.push(buildSearchUrl(query));
  }

  const [searchAmount, setSearchAmount] = useState(amountPerPage);

  const [
    getPublicationsForSearchQuery,
    { data: publicationsForSearchQuery, loading: loadingForSearchQuery },
  ] = useLazyQuery(GetSearchResultsCoordinatesDocument, {
    variables: {
      query: query,
      page: page,
      amountPerPage: searchAmount,
    },
  });

  const [
    getPublicationsForPublicationWithId,
    {
      data: publicationsForPublicationWithId,
      loading: loadingForPublicationWithId,
    },
  ] = useLazyQuery(
    GetSimilarPublicationsForPublicationWithIdCoordinatesDocument,
    {
      variables: {
        id: query,
        page: page,
        amountPerPage: searchAmount,
      },
    }
  );

  const [
    getSearchPublication,
    { data: searchPublication, loading: loadingsearchPublication },
  ] = useLazyQuery(GetPublicationDocument, {
    variables: {
      id: query,
    },
  });

  useEffect(() => {
    const loadPublications = async () => {
      if (searchType === SearchStrategy.Id) {
        await getSearchPublication();
        await getPublicationsForPublicationWithId();
        return;
      }
      await getPublicationsForSearchQuery();
    };
    loadPublications();
  }, [
    getPublicationsForSearchQuery,
    getPublicationsForPublicationWithId,
    getSearchPublication,
    searchType,
  ]);

  const getAllPublications = () => {
    if (searchType === SearchStrategy.Id) {
      return {
        publications:
          publicationsForPublicationWithId
            ?.similarPublicationsForPublicationWithId.similarPublications || [],
        searchCoordinate:
          publicationsForPublicationWithId
            ?.similarPublicationsForPublicationWithId.searchCoordinate,
      };
    }

    const matchingPublications =
      publicationsForSearchQuery?.publications.matchingPublications || [];
    const similarPublications =
      publicationsForSearchQuery?.publications.similarPublications || [];
    const allPublications = _.zip(matchingPublications, similarPublications)
      .flat()
      .filter(
        (publication) => publication !== undefined
      ) as PublicationResponseDto[];

    return {
      publications: allPublications,
      searchCoordinate:
        publicationsForSearchQuery?.publications.searchCoordinate,
    };
  };

  const { publications, searchCoordinate } = getAllPublications();

  return (
    <RoomScene
      query={query}
      searchPublication={
        searchPublication?.publication as PublicationResponseDto
      }
      publications={publications as PublicationResponseDto[]}
      searchType={searchType}
      searchCoordinate={searchCoordinate}
      loadingStates={[
        loadingForSearchQuery,
        loadingForPublicationWithId,
        loadingsearchPublication,
      ]}
      searchAmount={searchAmount}
      setSearchAmount={setSearchAmount}
    />
  );
}
