import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SidebarState = {
  isCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapse: (collapsed: boolean) => void;
};

const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      toggleSidebarCollapse: () => {
        set((state) => ({ isCollapsed: !state.isCollapsed }));
      },
      setSidebarCollapse: (collapsed) => {
        set(() => ({ isCollapsed: collapsed }));
      },
    }),
    {
      name: "visualisation-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useSidebarStore;
