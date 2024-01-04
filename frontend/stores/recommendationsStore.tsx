import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type RecommendationsState = {
  publicationGroup: string[];
  addPublication: (id: string) => void;
  removePublication: (id: string) => void;
};

const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      publicationGroup: [],
      addPublication: (id) => {
        set((state) => ({ publicationGroup: [...state.publicationGroup, id] }));
      },
      removePublication: (id) => {
        set((state) => ({
          publicationGroup: state.publicationGroup.filter(
            (publication) => publication != id
          ),
        }));
      },
    }),
    {
      name: "recommendations-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useRecommendationsStore;
