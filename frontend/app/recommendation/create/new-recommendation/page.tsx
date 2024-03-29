"use client";
import { Suspense, useEffect } from "react";
import { Header } from "@/components/Header";
import { useSession } from "next-auth/react";
import { useMutation } from "@apollo/client";
import { CreateRecommendationDocument } from "@/graphql/mutation/CreateRecommendation.generated";
import { CreateRecommendationOnFavoritesDocument } from "@/graphql/mutation/CreateRecommendationOnFavorites.generated";
import useRecommendationsStore from "@/stores/recommendationsStore";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import { DOCUMENT_TYPES } from "@/constants/enums";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import DeleteButton from "@/components/DeleteButton";
import { useRouter } from "next/navigation";
import { useSticky } from "@/hooks/UseSticky";

type SearchParams = {
  searchParams: {
    onFavorites: boolean | undefined;
  };
};

export default function RecommendationResult({ searchParams }: SearchParams) {
  const session = useSession();
  const { publicationGroup, clearPublications } = useRecommendationsStore();

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
    variables: {
      group: publicationGroup,
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
        if (searchParams.onFavorites && session.status === "authenticated") {
          await createRecommendationOnFavorites();
        } else {
          await createRecommendation();
        }
      } catch (error) {}
    };

    loadRecommendation();
  }, [
    session.status,
    createRecommendation,
    createRecommendationOnFavorites,
    searchParams.onFavorites,
  ]);

  const onClearSelection = () => {
    clearPublications();
    toast({
      variant: "destructive",
      title: "Selection cleared",
      description: "Selection of publications for recommendations was cleared",
    });
  };

  useEffect(() => {
    if (createRecommendationError?.message && publicationGroup.length <= 0) {
      router.replace("/");
    }
  }, [router, createRecommendationError, publicationGroup]);

  return (
    <>
      <Header
        title="New Recommendation"
        subtitle={`your recommendation created from your ${
          searchParams.onFavorites ? "favorites" : "publication selection"
        }`}
      />
      <div className="items-center gap-4 flex-col w-full">
        <div
          className={`flex flex-row ${
            searchParams.onFavorites ? "justify-end" : "justify-between"
          } w-full sticky top-0 ${
            isSticky &&
            "-mx-4 p-4 rounded-b-md bg-background border z-[51] !w-auto shadow-md"
          }`}
          ref={ref}
        >
          {!searchParams.onFavorites && (
            <DeleteButton
              onClick={onClearSelection}
              text="Clear your publication selection !"
              dialogTitle="Clear selection"
              dialogText="Do you really want to delete your selection of publication?"
            />
          )}
          <div className="flex flex-row gap-4">
            <Link
              href="/"
              className={buttonVariants({
                variant: "default",
              })}
            >
              Back to search
            </Link>
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
          </div>
        </div>
        <div className="py-4 gap-4 flex flex-col">
          <Suspense fallback={<SearchResultSkeleton publicationAmount={10} />}>
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
          </Suspense>
        </div>
      </div>
    </>
  );
}
