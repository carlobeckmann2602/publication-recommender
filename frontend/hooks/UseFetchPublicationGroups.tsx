import { GetPublicationGroupsDocument } from "@/graphql/queries/GetPublicationGroups.generated";
import { PublicationGroupResponseDto } from "@/graphql/types.generated";
import usePublicationGroupStore from "@/stores/publicationGroupStore";
import { useLazyQuery } from "@apollo/client";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useFetchPublicationGroups() {
  const session = useSession();
  const { publicationGroups, setPublicationGroups } =
    usePublicationGroupStore();

  const [getPublicationGroups] = useLazyQuery(GetPublicationGroupsDocument, {
    fetchPolicy: "cache-and-network",
    context: {
      headers: {
        Authorization: `Bearer ${session.data?.userToken.jwtToken}`,
      },
    },
  });

  const fetchPublicationGroups = useCallback(async () => {
    try {
      const { data } = await getPublicationGroups();
      if (data) {
        setPublicationGroups(
          data?.publicationGroups as PublicationGroupResponseDto[]
        );
      }
    } catch (e: any) {
      console.error(e.message);
    }
  }, [getPublicationGroups, setPublicationGroups]);

  return { publicationGroups, fetchPublicationGroups };
}
