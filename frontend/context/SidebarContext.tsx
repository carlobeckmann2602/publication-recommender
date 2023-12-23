import { createContext, useState } from "react";

type Props = {
  children: React.ReactNode;
};

const initialValue = { isCollapsed: false, toggleSidebarcollapse: () => {} };
const SidebarContext = createContext(initialValue);

const SidebarProvider = ({ children }: Props) => {
  const [isCollapsed, setCollapse] = useState(false);

  const toggleSidebarcollapse = () => {
    setCollapse((prevState) => !prevState);
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebarcollapse }}>
      {children}
    </SidebarContext.Provider>
  );
};

export { SidebarContext, SidebarProvider };
