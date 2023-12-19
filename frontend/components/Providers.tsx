"use client";
import { SessionProvider } from "next-auth/react";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { SidebarProvider } from "@/context/SidebarContext";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <ApolloWrapper>
        <SidebarProvider>{children}</SidebarProvider>
      </ApolloWrapper>
    </SessionProvider>
  );
};

export default Providers;
