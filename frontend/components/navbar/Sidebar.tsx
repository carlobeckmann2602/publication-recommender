import React, { ReactPropTypes } from "react";
import UserMenu from "./UserMenu";
import MainMenu from "./MainMenu";

type Props = {
  className?: string;
  props?: ReactPropTypes;
};

export default function Sidebar({ className, props }: Props) {
  return (
    <div className={`w-[200px] ${className}`}>
      <UserMenu />
      <MainMenu />
    </div>
  );
}
