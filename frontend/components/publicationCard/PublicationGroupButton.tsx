"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { Minus, Plus, PlusCircle } from "lucide-react";
import { useMutation } from "@apollo/client";
import { AddToPublicationGroupDocument } from "@/graphql/mutation/AddToPublicationGroup.generated";
import { useSession } from "next-auth/react";
import { RemoveFromPublicationGroupDocument } from "@/graphql/mutation/RemoveFromPublicationGroup.generated";
import { useToast } from "@/components/ui/use-toast";
import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";
import { PublicationGroupDto } from "@/graphql/types.generated";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import useRecommendationsStore from "@/stores/recommendationsStore";
import Latex from "@/lib/latex-converter";
import { ToastAction } from "@/components/ui/toast";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import PublicationGroupForm from "@/components/groups/PublicationGroupForm";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  id: string;
  title?: string;
};

export default function PublicationGroupButton(props: Props) {
  const { id, title } = props;

  const session = useSession();
  const { toast } = useToast();
  const [createDialogVisible, setCreateDialogVisible] = useState(false);
  const [selected, setSelected] = useState(false);

  const { recommendationGroup, addPublication, removePublication } =
    useRecommendationsStore();
  const { publicationGroups, fetchPublicationGroups } =
    useFetchPublicationGroups();

  const [addPublicationToGroupFunction] = useMutation(
    AddToPublicationGroupDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );

  const [removePublicationFromGroupFunction] = useMutation(
    RemoveFromPublicationGroupDocument,
    {
      context: {
        headers: {
          Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
        },
      },
    }
  );

  const addPublicationToGroup = async (group: PublicationGroupDto) => {
    try {
      let response = await addPublicationToGroupFunction({
        variables: {
          publicationgroup_id: group.id,
          publication_ids: [id],
        },
      });

      if (
        response.errors ||
        response.data?.addToPublicationGroup.success === false
      ) {
        toast({
          variant: "destructive",
          title: "An Error occured!",
          description: `Could not add publication to group "${group.name}".`,
        });
        return;
      }

      fetchPublicationGroups();
      toast({
        title: `Publication added to group`,
        description: `Successfully added publication to group "${group.name}".`,
        action: (
          <ToastAction
            className={buttonVariants({
              variant: "ghost",
            })}
            altText="Go to group"
            asChild
          >
            <Link href={`/groups/${group.id}`}>Go to group</Link>
          </ToastAction>
        ),
      });

      return;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error occured!",
        description: `Could not add publication to group "${group.name}".`,
      });
    }
  };

  const removePublicationFromGroup = async (group: PublicationGroupDto) => {
    try {
      let response = await removePublicationFromGroupFunction({
        variables: {
          publication_id: id,
          publicationgroup_id: group.id,
        },
      });

      if (
        response.errors ||
        response.data?.removeFromPublicationGroup.success === false
      ) {
        toast({
          variant: "destructive",
          title: "An Error occured!",
          description: `Could not remove publication from group "${group.name}".`,
        });
        return;
      }

      fetchPublicationGroups();
      toast({
        variant: "destructive",
        title: `Publication removed from group`,
        description: `Successfully removed publication from group "${group.name}".`,
        action: (
          <ToastAction
            className={buttonVariants({
              variant: "ghost",
            })}
            altText="Go to group"
            asChild
          >
            <Link href={`/groups/${group.id}`}>Go to group</Link>
          </ToastAction>
        ),
      });

      return;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "An Error occured!",
        description: `Could not remove publication from group "${group.name}".`,
      });
    }
  };

  const addToSelected = () => {
    addPublication(id);
    toast({
      title: "Publication added to selection",
      description: (
        <Latex>{`Publication \"${title}\" added to selection`}</Latex>
      ),
      action: (
        <ToastAction
          className={buttonVariants({
            variant: "ghost",
          })}
          altText="Go to selection"
          asChild
        >
          <Link href={`/recommendation/create`}>Go to selection</Link>
        </ToastAction>
      ),
    });
  };

  const removeFromSelected = () => {
    removePublication(id);
    toast({
      title: "Publication removed from selection",
      description: (
        <Latex>{`Publication \"${title}\" removed from selection`}</Latex>
      ),
      variant: "destructive",
      action: (
        <ToastAction
          className={buttonVariants({
            variant: "ghost",
          })}
          altText="Go to selection"
          asChild
        >
          <Link href={`/recommendation/create`}>Go to selection</Link>
        </ToastAction>
      ),
    });
  };

  useEffect(() => {
    setSelected(recommendationGroup.includes(id));
  }, [recommendationGroup, id]);

  return (
    <Dialog open={createDialogVisible} onOpenChange={setCreateDialogVisible}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <PlusCircle />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent align="start" sideOffset={10}>
            {session.status === "authenticated"
              ? "Add or remove publication from groups"
              : "Add or remove publication from selection"}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-56" align="start">
          {session.status === "authenticated" && (
            <div>
              {publicationGroups && publicationGroups.length > 0 && (
                <DropdownMenuGroup>
                  <DropdownMenuLabel>Groups</DropdownMenuLabel>
                  {publicationGroups.map((group) => (
                    <DropdownMenuCheckboxItem
                      key={group.id}
                      checked={
                        group.publications.find(
                          (currentGroup) => currentGroup.id === id
                        ) !== undefined
                      }
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) => {
                        checked
                          ? addPublicationToGroup(group)
                          : removePublicationFromGroup(group);
                      }}
                    >
                      <div className="w-full flex flex-row justify-start items-center gap-2">
                        <div
                          className={"w-[16px] h-[16px] rounded-[0.3rem]"}
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="text-ellipsis overflow-hidden">
                          {group.name}
                        </span>
                      </div>
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              )}
              <DropdownMenuGroup>
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <div className="w-full flex flex-row justify-start items-center gap-2">
                      <Plus size={16} />
                      <span>Add to new group</span>
                    </div>
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </div>
          )}
          <DropdownMenuGroup>
            <DropdownMenuLabel>Recommendation</DropdownMenuLabel>
          </DropdownMenuGroup>
          {selected && (
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              onClick={() => {
                removeFromSelected();
              }}
            >
              <div className="w-full flex flex-row justify-start items-center gap-2">
                <Minus size={16} />
                <span>Remove from selection</span>
              </div>
            </DropdownMenuItem>
          )}
          {!selected && (
            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              onClick={() => {
                addToSelected();
              }}
            >
              <div className="w-full flex flex-row justify-start items-center gap-2">
                <Plus size={16} />
                <span>Add to selection</span>
              </div>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      {/* Based on content & styling of <CreatePublicationGroupModal/>-Component. Has to be implemented as a dialog (instead of modal) as it is triggered from a dropdown menu. */}
      <DialogContent className="max-w-full w-10/12 md:w-8/12 lg:w-1/2 p-6">
        <DialogHeader>
          <CardHeader>
            <CardTitle className="text-center">Create a new Group</CardTitle>
            <CardDescription className="text-center">
              Create a new group to organise publications according to your
              needs, for example different topics or projects. Choose a name and
              color for your group to make it easier to recognise.
            </CardDescription>
          </CardHeader>
        </DialogHeader>
        <PublicationGroupForm
          initialPapers={[id]}
          withNavigation={false}
          onClose={() => setCreateDialogVisible(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
