"use client";
import { SessionProvider } from "next-auth/react";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { SidebarProvider } from "@/context/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <ApolloWrapper>
        <SidebarProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </SidebarProvider>
      </ApolloWrapper>
    </SessionProvider>
  );
};

export default Providers;
