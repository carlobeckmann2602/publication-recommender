import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type RecommendationsState = {
  recommendationGroup: string[];
  addPublication: (id: string) => void;
  removePublication: (id: string) => void;
  clearPublications: () => void;
};

const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set) => ({
      recommendationGroup: [],
      addPublication: (id) => {
        set((state) => ({
          recommendationGroup: [...state.recommendationGroup, id],
        }));
      },
      removePublication: (id) => {
        set((state) => ({
          recommendationGroup: state.recommendationGroup.filter(
            (publication) => publication != id
          ),
        }));
      },
      clearPublications: () => {
        set({ recommendationGroup: [] });
      },
    }),
    {
      name: "recommendations-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useRecommendationsStore;
