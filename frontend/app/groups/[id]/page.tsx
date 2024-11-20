"use client";
import CardViewToggle from "@/components/CardViewToggle";
import { Header } from "@/components/Header";
import Modal from "@/components/Modal";
import ModalCloseButton from "@/components/ModalCloseButton";
import ScrollToButton from "@/components/ScrollToButton";
import PublicationGroupForm from "@/components/groups/PublicationGroupForm";
import PublicationCard from "@/components/publicationCard/PublicationCard";
import RoomScene from "@/components/roomVisualisation/RoomScene";
import SearchResultSkeleton from "@/components/search/SearchResultSkeleton";
import { Searchbar } from "@/components/search/Searchbar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs } from "@/components/ui/tabs";
import { TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { DOCUMENT_TYPES, SearchStrategy } from "@/constants/enums";
import { DeletePublicationGroupDocument } from "@/graphql/mutation/DeletePublicationgroup.generated";
import { GetPublicationGroupDocument } from "@/graphql/queries/GetPublicationGroup.generated";
import { PublicationResponseDto } from "@/graphql/types.generated";
import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";
import { useSticky } from "@/hooks/UseSticky";
import { useLazyQuery, useMutation } from "@apollo/client";
import { TabsContent } from "@radix-ui/react-tabs";
import { Tooltip } from "@radix-ui/react-tooltip";
import {
  ChevronDown,
  Pencil,
  PlusCircle,
  Settings,
  Trash2,
  Wand2,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

type SearchParams = {
  params: {
    id: string;
  };
};

export default function PublicationGroups({ params }: SearchParams) {
  const session = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { ref, isSticky } = useSticky();
  const { fetchPublicationGroups } = useFetchPublicationGroups();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);

  const [
    getPublicationgroup,
    { data: publicationGroupData, error: fetchError },
  ] = useLazyQuery(GetPublicationGroupDocument, {
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
    variables: {
      id: params.id,
    },
  });

  const [deletePublicationgroup, { data: deleteData, error: deleteError }] =
    useMutation(DeletePublicationGroupDocument, {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
      variables: {
        id: params.id,
      },
    });

  useEffect(() => {
    const loadPublicationgroup = async () => {
      if (session.status === "loading") return;

      if (session.status === "unauthenticated") {
        router.push("/");
        return;
      }

      if (!publicationGroupData && !fetchError) {
        await getPublicationgroup();
      }

      if (fetchError) {
        router.push("/");
        toast({
          variant: "destructive",
          title: `An error occured while fetching group data`,
          description:
            fetchError.message ===
            "Access to the publication group is denied to the current user"
              ? "You do not have access to this group."
              : "",
        });
        console.error(fetchError.message);
        return;
      }
    };

    loadPublicationgroup();
  }, [
    session,
    getPublicationgroup,
    fetchError,
    router,
    toast,
    publicationGroupData,
  ]);

  const onDelete = async () => {
    try {
      await deletePublicationgroup();
      if (deleteError || deleteData?.deletePublicationGroup.success === false)
        throw Error;
      fetchPublicationGroups();
      router.push("/");
      toast({
        variant: "destructive",
        title: `Group "${publicationGroupData?.publicationGroup.name}" was deleted successfully.`,
      });
    } catch (error: any) {
      console.error(error.message);
    }
  };

  const renderEditModal = () => {
    return (
      <Modal>
        <Card className="shadow-lg relative overflow-auto max-h-[95vh]">
          <CardHeader>
            <ModalCloseButton onClose={() => setEditModalVisible(false)} />
            <CardTitle className="text-center">{`Edit group "${publicationGroupData?.publicationGroup.name}"`}</CardTitle>
            <CardDescription className="text-center">
              Change the name and color of the group to your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col w-full gap-6">
              <PublicationGroupForm
                id={publicationGroupData?.publicationGroup.id}
                currentName={publicationGroupData?.publicationGroup.name}
                currentColor={publicationGroupData?.publicationGroup.color}
                onClose={() => setEditModalVisible(false)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between" />
        </Card>
      </Modal>
    );
  };

  const renderDeleteDialog = () => {
    return (
      <AlertDialog open={deleteDialogVisible}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="leading-normal">
              {`Delete group "${publicationGroupData?.publicationGroup.name}"`}
            </AlertDialogTitle>
          </AlertDialogHeader>
          {`Are you sure you want to delete the group "${publicationGroupData?.publicationGroup.name}"? Caution: This action cannot be undone.`}
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel className="w-1/2" asChild>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDeleteDialogVisible(false)}
              >
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction className="w-1/2" asChild>
              <Button type="submit" onClick={onDelete}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  const renderSettingsMenu = () => {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent align="end">Options</TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setEditModalVisible(true);
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <Pencil size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteDialogVisible(true)}>
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  if (publicationGroupData?.publicationGroup.publications.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <Header
          title={publicationGroupData?.publicationGroup.name}
          borderColor={publicationGroupData?.publicationGroup.color}
        />
        {editModalVisible && (
          <div className="absolute">{renderEditModal()}</div>
        )}
        {renderDeleteDialog()}
        <div className="w-full flex flex-row gap-4 justify-end items-center">
          <Link
            aria-disabled
            tabIndex={-1}
            href="#"
            className={buttonVariants({
              variant: "ghost",
              className: "pointer-events-none bg-accent",
            })}
            onClick={() =>
              toast({
                title: "Recommendation created",
                description: `Recommendation created based on your group ${publicationGroupData?.publicationGroup.name}.`,
              })
            }
          >
            Create a recommendation based on group
            <Wand2 size={20} className="ml-4" />
          </Link>
          <Tabs defaultValue="grid">
            <CardViewToggle disabled />
          </Tabs>
          {renderSettingsMenu()}
        </div>
        <div className="grow flex flex-col gap-4 justify-center items-center">
          <div className="text-2xl font-medium text-center w-full">
            This group has no publications yet!
          </div>
          <div className="text-lg font-normal text-center w-full">
            Use groups to save and organize your publications. Add publications
            by clicking the{" "}
            <kbd
              className={`${buttonVariants({
                variant: "secondary",
                size: "icon",
              })}`}
            >
              <PlusCircle size={16} />
            </kbd>{" "}
            button on a publication and selecting this group.
          </div>
          <Searchbar className="my-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header
        title={publicationGroupData?.publicationGroup.name}
        borderColor={publicationGroupData?.publicationGroup.color}
      />
      <Tabs defaultValue="grid" className="w-full h-full grow flex flex-col">
        <div
          className={`flex flex-row flex-wrap gap-4 justify-end w-full sticky top-0 z-40 ${
            isSticky &&
            "-mx-4 p-4 rounded-b-md bg-background border !w-auto shadow-md"
          }`}
          ref={ref}
        >
          {editModalVisible && (
            <div className="absolute">{renderEditModal()}</div>
          )}
          {renderDeleteDialog()}
          <Link
            href={`/recommendation/create/new-recommendation?groupID=${params.id}`}
            className={buttonVariants({
              variant: "default",
            })}
            onClick={() =>
              toast({
                title: "Recommendation created",
                description: `Recommendation created based on your group ${publicationGroupData?.publicationGroup.name}.`,
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
          <CardViewToggle />
          {renderSettingsMenu()}
        </div>
        <TabsContent value="grid">
          <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
            <Suspense fallback={<SearchResultSkeleton publicationAmount={6} />}>
              {publicationGroupData?.publicationGroup.publications.map(
                (publication) => (
                  <PublicationCard
                    key={publication.id}
                    id={publication.id}
                    title={publication.title}
                    authors={publication.authors}
                    date={
                      publication.publicationDate
                        ? new Date(publication.publicationDate)
                        : undefined
                    }
                    link={publication.url}
                    doi={publication.doi}
                    documentType={DOCUMENT_TYPES.PAPER}
                    abstract={publication.abstract}
                  />
                )
              )}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="my-4 flex flex-col gap-4 w-full">
            <Suspense fallback={<SearchResultSkeleton publicationAmount={6} />}>
              {publicationGroupData?.publicationGroup.publications.map(
                (publication) => (
                  <PublicationCard
                    key={publication.id}
                    id={publication.id}
                    title={publication.title}
                    authors={publication.authors}
                    date={
                      publication.publicationDate
                        ? new Date(publication.publicationDate)
                        : undefined
                    }
                    link={publication.url}
                    doi={publication.doi}
                    documentType={DOCUMENT_TYPES.PAPER}
                    abstract={publication.abstract}
                  />
                )
              )}
            </Suspense>
          </div>
        </TabsContent>
        <TabsContent value="room" className="my-4 !ring-0 grow relative">
          <RoomScene
            publications={
              publicationGroupData?.publicationGroup
                .publications as PublicationResponseDto[]
            }
            searchType={SearchStrategy.Group}
            searchCoordinate={
              publicationGroupData?.publicationGroup.publications[0].coordinate
            }
            roomCenterDesc={
              "Group center: " + publicationGroupData?.publicationGroup.name
            }
            groupColor={publicationGroupData?.publicationGroup.color}
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
