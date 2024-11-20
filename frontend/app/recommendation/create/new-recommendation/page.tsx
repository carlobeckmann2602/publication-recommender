"use client";
import { Suspense, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { CreateRecommendationDocument } from "@/graphql/mutation/CreateRecommendation.generated";
import { CreateRecommendationOnFavoritesDocument } from "@/graphql/mutation/CreateRecommendationOnFavorites.generated";
import useRecommendationsStore from "@/stores/recommendationsStore";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES, SearchStrategy } from "@/constants/enums";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import DeleteButton from "@/components/DeleteButton";
import { useRouter } from "next/navigation";
import { useSticky } from "@/hooks/UseSticky";
import CardViewToggle from "@/components/CardViewToggle";
import usePublicationGroupStore from "@/stores/publicationGroupStore";
import CreateGroupModal from "@/components/groups/CreateGroupModal";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import RoomScene from "@/components/roomVisualisation/RoomScene";
import { PublicationResponseDto } from "@/graphql/types.generated";
import ScrollToButton from "@/components/ScrollToButton";

type SearchParams = {
  searchParams: {
    temp: boolean | undefined;
    onFavorites: boolean | undefined;
    groupID: string | undefined;
  };
};

export default function RecommendationResult({ searchParams }: SearchParams) {
  const session = useSession();
  const { recommendationGroup, clearPublications } = useRecommendationsStore();
  const { publicationGroups } = usePublicationGroupStore();
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const { ref, isSticky } = useSticky();

  const [
    createRecommendation,
    { error: createRecommendationError, data: recommendationData },
  ] = useMutation(CreateRecommendationDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const [
    createRecommendationOnFavorites,
    {
      error: createRecommendationOnFavoritesError,
      data: recommendationOnFavoritesData,
    },
  ] = useMutation(CreateRecommendationOnFavoritesDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  useEffect(() => {
    const loadRecommendation = async () => {
      try {
        if (
          searchParams.onFavorites &&
          session.status === "authenticated" &&
          !recommendationOnFavoritesData
        ) {
          await createRecommendationOnFavorites();
          return;
        }

        if (
          searchParams.groupID &&
          session.status === "authenticated" &&
          !recommendationData
        ) {
          const group = publicationGroups.find(
            (group) => group.id === searchParams.groupID
          );

          if (!group) {
            throw new Error("The group for the recommendation was not found");
          }

          await createRecommendation({
            variables: {
              group: group.publications.map((publication) => publication.id),
            },
          });

          return;
        }

        if (!recommendationData) {
          await createRecommendation({
            variables: {
              group: recommendationGroup,
            },
          });
        }
      } catch (error) {}
    };

    loadRecommendation();
  }, [
    session.status,
    createRecommendation,
    createRecommendationOnFavorites,
    searchParams.onFavorites,
    searchParams.groupID,
    recommendationGroup,
    publicationGroups,
    recommendationData,
    recommendationOnFavoritesData,
  ]);

  const onClearSelection = () => {
    clearPublications();
    toast({
      variant: "destructive",
      title: "Selection cleared",
      description:
        "Temporary selection of publications for recommendations was cleared",
    });
  };

  useEffect(() => {
    if (createRecommendationError?.message && recommendationGroup.length <= 0) {
      router.replace("/");
    }
  }, [router, createRecommendationError, recommendationGroup]);

  const renderCreateGroupModal = () => {
    return (
      <CreateGroupModal
        initialPapers={
          searchParams.onFavorites
            ? recommendationOnFavoritesData?.createNewRecommendation.publications.map(
                (publication) => publication.id
              )
            : recommendationData?.createNewRecommendation.publications.map(
                (publication) => publication.id
              )
        }
        withNavigation={false}
        onClose={() => setCreateModalVisible(false)}
      />
    );
  };

  const getHeaderSubtitle = () => {
    let type = "Your recommendation created from your ";

    if (searchParams.onFavorites) {
      return type + "favorites";
    }

    if (searchParams.temp) {
      return type + "temporary selection";
    }

    if (searchParams.groupID) {
      let group = publicationGroups.find(
        (currentGroup) => currentGroup.id === searchParams.groupID
      );

      if (group) {
        return type + `group "${group.name}"`;
      }
    }
    return type + "group";
  };

  return (
    <div className="flex flex-col h-full">
      {createModalVisible && (
        <div className="absolute">{renderCreateGroupModal()}</div>
      )}
      <Header title="New Recommendation" subtitle={getHeaderSubtitle()} />
      <Tabs defaultValue="grid" className="w-full h-full grow flex flex-col">
        <div
          className={`flex flex-col flex-wrap md:flex-row gap-4 justify-end w-full sticky top-0 z-40
            ${
              isSticky &&
              "-mx-4 p-4 rounded-b-md bg-background border !w-auto shadow-md"
            }`}
          ref={ref}
        >
          {searchParams.temp ? (
            <DeleteButton
              onClick={onClearSelection}
              text="Clear your publication selection"
              dialogTitle="Clear selection"
              dialogText="Do you really want to delete your selection of publication?"
            />
          ) : (
            <div className="flex grow" />
          )}
          <Link
            href="/"
            className={buttonVariants({
              variant: "default",
            })}
          >
            Back to search
          </Link>
          {session.status === "authenticated" && (
            <Button
              type="submit"
              onClick={() => {
                setCreateModalVisible(true);
              }}
            >
              Create group from results
            </Button>
          )}
          {session.status === "authenticated" && (
            <Link
              href="/profile/recommendation"
              className={buttonVariants({
                variant: "secondary",
              })}
            >
              See all your recommendations
            </Link>
          )}
          <CardViewToggle
            disabled={
              createRecommendationError != undefined ||
              createRecommendationOnFavoritesError != undefined
            }
          />
        </div>
        <TabsContent value="grid">
          <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
            <Suspense
              fallback={<SearchResultSkeleton publicationAmount={10} />}
            >
              {searchParams.onFavorites
                ? recommendationOnFavoritesData?.createNewRecommendation.publications.map(
                    (publication) => (
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
                    )
                  )
                : recommendationData?.createNewRecommendation.publications.map(
                    (publication) => (
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
                    )
                  )}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="my-4 flex flex-col gap-4 w-full">
            <Suspense
              fallback={<SearchResultSkeleton publicationAmount={10} />}
            >
              {searchParams.onFavorites
                ? recommendationOnFavoritesData?.createNewRecommendation.publications.map(
                    (publication) => (
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
                    )
                  )
                : recommendationData?.createNewRecommendation.publications.map(
                    (publication) => (
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
                    )
                  )}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="room" className="my-4 !ring-0 grow relative">
          <RoomScene
            publications={
              (searchParams.onFavorites
                ? recommendationOnFavoritesData?.createNewRecommendation
                    .publications
                : recommendationData?.createNewRecommendation
                    .publications) as PublicationResponseDto[]
            }
            searchType={SearchStrategy.Group}
            searchCoordinate={
              searchParams.onFavorites
                ? recommendationOnFavoritesData?.createNewRecommendation
                    .publications[0].coordinate
                : recommendationData?.createNewRecommendation.publications[0]
                    .coordinate
            }
            roomCenterDesc="Recommendation center"
            className="min-h-[calc(100dvh-5.5rem)] hmd:min-h-0"
          />
          <ScrollToButton
            tooltipText="Scroll to view"
            target="bottom"
            className="hmd:hidden"
          />
        </TabsContent>
        {createRecommendationError && (
          <Alert variant="destructive" className="w-3/4 self-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {createRecommendationError.message}
            </AlertDescription>
          </Alert>
        )}
        {createRecommendationOnFavoritesError && (
          <Alert variant="destructive" className="w-3/4 self-center">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {createRecommendationOnFavoritesError.message}
            </AlertDescription>
          </Alert>
        )}
      </Tabs>
    </div>
  );
}
