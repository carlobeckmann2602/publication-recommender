import { PublicationGroupResponseDto } from "@/graphql/types.generated";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type PublicationGroupState = {
  publicationGroups: PublicationGroupResponseDto[];
  setPublicationGroups: (
    publicationGroups: PublicationGroupResponseDto[]
  ) => void;
};

const usePublicationGroupStore = create<PublicationGroupState>()(
  persist(
    (set) => ({
      publicationGroups: [],
      setPublicationGroups: (newPublicationGroups) => {
        set(() => ({ publicationGroups: [...newPublicationGroups] }));
      },
    }),
    {
      name: "publicationgroup-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default usePublicationGroupStore;
