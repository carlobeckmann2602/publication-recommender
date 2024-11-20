import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type VisualisationState = {
  showControlSlides: boolean;
  switchShowControlSlides: () => void;
  showGrid: boolean;
  switchShowGrid: () => void;
};

const useVisualisationStore = create<VisualisationState>()(
  persist(
    (set) => ({
      showControlSlides: true,
      switchShowControlSlides: () => {
        set((state) => ({ showControlSlides: !state.showControlSlides }));
      },
      showGrid: true,
      switchShowGrid: () => {
        set((state) => ({ showGrid: !state.showGrid }));
      },
    }),
    {
      name: "visualisation-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useVisualisationStore;
