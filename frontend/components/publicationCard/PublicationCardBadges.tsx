"use client";

import { useFetchPublicationGroups } from "@/hooks/UseFetchPublicationGroups";
import Link from "next/link";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

type Props = {
  id: string;
};

export default function PublicationGroupBadges(props: Props) {
  const { publicationGroups } = useFetchPublicationGroups();
  const session = useSession();

  if (session.status != "authenticated") {
    return;
  }

  return (
    <div className="flex grow flex-row gap-2 items-center justify-start overflow-auto sw-full flex-wrap @3xl/card:w-60">
      {publicationGroups &&
        publicationGroups.map((group) => {
          if (
            group.publications.find(
              (currentGroup) => currentGroup.id === props.id
            ) !== undefined
          ) {
            return (
              <Link
                className={cn(
                  badgeVariants({ variant: "default" }),
                  "text-white h-[24px] !rounded-[0.5rem]"
                )}
                key={group.id}
                style={{ backgroundColor: group.color }}
                href={`/groups/${group.id}`}
              >
                <p className="truncate">{group.name}</p>
              </Link>
            );
          }
        })}
    </div>
  );
}
