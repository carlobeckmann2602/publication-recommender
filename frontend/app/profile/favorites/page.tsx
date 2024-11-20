"use client";
import CardViewToggle from "@/components/CardViewToggle";
import { Header } from "@/components/Header";
import ScrollToButton from "@/components/ScrollToButton";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import RoomScene from "@/components/roomVisualisation/RoomScene";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import { Searchbar } from "@/components/search/Searchbar";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { DOCUMENT_TYPES, SearchStrategy } from "@/constants/enums";
import { GetFavoritesDocument } from "@/graphql/queries/GetFavorites.generated";
import { PublicationResponseDto } from "@/graphql/types.generated";
import { useSticky } from "@/hooks/UseSticky";
import { useLazyQuery } from "@apollo/client";
import { Heart, Wand2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect } from "react";

export default function Favorites() {
  const session = useSession();
  const { toast } = useToast();
  const { ref, isSticky } = useSticky();

  const [getFavorites, { data }] = useLazyQuery(GetFavoritesDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  useEffect(() => {
    const loadFavorites = async () => {
      if (session.status === "authenticated") {
        await getFavorites();
      }
    };

    loadFavorites();
  }, [session, getFavorites]);

  if (data?.favorites.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Favorites" subtitle="your favourite publications" />
        <div className="grow flex flex-col gap-4 justify-center items-center">
          <div className="text-2xl font-medium text-center w-full">
            You have no favorite publications!
          </div>
          <div className="text-lg font-normal text-center w-full">
            To favorite publications simply press the button{" "}
            <kbd
              className={`${buttonVariants({
                variant: "secondary",
                size: "icon",
              })}`}
            >
              <Heart size={20} />
            </kbd>{" "}
            on the publication you want to favorite.
          </div>
          <Searchbar className="my-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Favorites" subtitle="your favourite publications" />
      <Tabs defaultValue="grid" className="w-full h-full grow flex flex-col">
        <div
          className={`flex flex-row flex-wrap gap-4 justify-end w-full sticky top-0 z-40 ${
            isSticky &&
            "-mx-4 p-4 rounded-b-md bg-background border !w-auto shadow-md"
          }`}
          ref={ref}
        >
          <Link
            href="/recommendation/create/new-recommendation?onFavorites=true"
            className={buttonVariants({
              variant: "default",
              className: "h-fit !whitespace-normal",
            })}
            style={{ minHeight: "2.5rem" }}
            onClick={() =>
              toast({
                title: "Recommendation created",
                description: "Recommendation created based on your favorites",
              })
            }
          >
            <span className={`${isSticky && "hidden hmd:block"}`}>
              Create a recommendation based on group
            </span>
            <Wand2
              size={20}
              className={`${isSticky ? "ml-0 hmd:ml-4" : "ml-4"}`}
            />
          </Link>
          <CardViewToggle disabled={data?.favorites.length === 0} />
        </div>
        <TabsContent value="grid">
          <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
            <Suspense fallback={<SearchResultSkeleton publicationAmount={6} />}>
              {data?.favorites.map((favorite) => (
                <PublicationCard
                  key={favorite.id}
                  id={favorite.id}
                  title={favorite.title}
                  authors={favorite.authors}
                  date={
                    favorite.publicationDate
                      ? new Date(favorite.publicationDate)
                      : undefined
                  }
                  link={favorite.url}
                  doi={favorite.doi}
                  documentType={DOCUMENT_TYPES.PAPER}
                  enableLikeWarning={true}
                  abstract={favorite.abstract}
                />
              ))}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="my-4 flex flex-col gap-4 w-full">
            <Suspense fallback={<SearchResultSkeleton publicationAmount={6} />}>
              {data?.favorites.map((favorite) => (
                <PublicationCard
                  key={favorite.id}
                  id={favorite.id}
                  title={favorite.title}
                  authors={favorite.authors}
                  date={
                    favorite.publicationDate
                      ? new Date(favorite.publicationDate)
                      : undefined
                  }
                  link={favorite.url}
                  doi={favorite.doi}
                  documentType={DOCUMENT_TYPES.PAPER}
                  enableLikeWarning={true}
                  abstract={favorite.abstract}
                />
              ))}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="room" className="my-4 !ring-0 grow relative">
          <RoomScene
            publications={data?.favorites as PublicationResponseDto[]}
            searchType={SearchStrategy.Group}
            searchCoordinate={data?.favorites[0].coordinate}
            enableLikeWarning={true}
            roomCenterDesc="Favorites"
            groupColor="red"
            className="min-h-[calc(100dvh-5.5rem)] hmd:min-h-0"
          />
          <ScrollToButton
            tooltipText="Scroll to view"
            target="bottom"
            className="hmd:hidden"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
