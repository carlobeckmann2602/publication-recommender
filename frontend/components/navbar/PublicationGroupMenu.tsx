"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LibraryBig, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";

export default function PublicationGroupMenu({
  clickCallback,
  isCollapsed,
}: {
  clickCallback: () => void;
  isCollapsed: boolean;
}) {
  const session = useSession();
  const pathname = usePathname();

  const baseHref = "groups";

  const { publicationGroups, fetchPublicationGroups } =
    useFetchPublicationGroups();

  useEffect(() => {
    if (session.status === "authenticated") {
      fetchPublicationGroups();
    }
  }, [session.status, fetchPublicationGroups]);

  const getGroupUrl = (publicationGroupId: string) => {
    return `/${baseHref}/${publicationGroupId}`;
  };

  if (session.status != "authenticated") return;
  if (isCollapsed)
    return (
      <Accordion
        type="single"
        collapsible
        className={"w-full flex !justify-start"}
      >
        <AccordionItem value="publicationgroups" className="w-full border-none">
          <Tooltip>
            <TooltipTrigger className="w-full">
              <AccordionTrigger
                className={`${
                  pathname === baseHref
                    ? buttonVariants({ variant: "secondary" })
                    : buttonVariants({ variant: "ghost" })
                } w-full h-12 flex hover:no-underline`}
              >
                <div>
                  <LibraryBig size={24} />
                  <span className="transition-all duration-700 hidden">
                    Groups
                  </span>
                </div>
              </AccordionTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              Groups
            </TooltipContent>
          </Tooltip>
          <AccordionContent className="w-full flex flex-col items-center">
            {publicationGroups?.map((publicationGroup) => {
              return (
                <Tooltip key={publicationGroup.id}>
                  <TooltipTrigger className={"mt-1"} asChild>
                    <Link
                      key={publicationGroup.id}
                      href={getGroupUrl(publicationGroup.id)}
                      className={`${
                        pathname === getGroupUrl(publicationGroup.id)
                          ? buttonVariants({
                              variant: "secondary",
                            })
                          : buttonVariants({
                              variant: "ghost",
                            })
                      } w-12 h-10 !p-2`}
                      onClick={clickCallback}
                    >
                      <div
                        className={"w-[20px] h-[20px] rounded-[0.3rem]"}
                        style={{ backgroundColor: publicationGroup.color }}
                      />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={10}>
                    <span className="text-ellipsis overflow-hidden">
                      {publicationGroup.name}
                    </span>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            <Tooltip>
              <TooltipTrigger className={"mt-1"} asChild>
                <Link
                  href={`/${baseHref}/create`}
                  className={`${buttonVariants({
                    variant: "ghost",
                  })} w-12 h-10 !p-2`}
                >
                  <Plus size={20} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                Create new Group
              </TooltipContent>
            </Tooltip>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );

  return (
    <Accordion
      type="single"
      collapsible
      className={"w-full flex !justify-start"}
    >
      <AccordionItem value="publicationgroups" className="w-full border-none">
        <AccordionTrigger
          className={`${
            pathname === baseHref
              ? buttonVariants({ variant: "secondary" })
              : buttonVariants({ variant: "ghost" })
          } w-full h-12 flex gap-4 hover:no-underline`}
        >
          <div className="flex flex-row gap-4 items-center flex-1 justify-start">
            <LibraryBig size={24} />
            <span>Groups</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="w-full pl-4 flex flex-col">
          {publicationGroups?.map((publicationGroup) => {
            return (
              <Link
                key={publicationGroup.id}
                href={getGroupUrl(publicationGroup.id)}
                className={`${
                  pathname === getGroupUrl(publicationGroup.id)
                    ? buttonVariants({
                        variant: "secondary",
                      })
                    : buttonVariants({
                        variant: "ghost",
                      })
                } w-full h-10 mt-1 flex gap-4 !justify-start`}
                onClick={clickCallback}
              >
                <div
                  className={"w-4 h-4 rounded-[0.3rem]"}
                  style={{ backgroundColor: publicationGroup.color }}
                />
                <span className="text-ellipsis overflow-hidden">
                  {publicationGroup.name}
                </span>
              </Link>
            );
          })}
          <Link
            href={`/${baseHref}/create`}
            className={`${buttonVariants({
              variant: "ghost",
            })} w-full h-10 mt-1 flex gap-3 !justify-start`}
          >
            <Plus size={20} />
            <span>Create new Group</span>
          </Link>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
