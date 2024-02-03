"use client";
import { SessionProvider } from "next-auth/react";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { SidebarProvider } from "@/context/SidebarContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

type Props = {
  children: React.ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <ApolloWrapper>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <TooltipProvider>{children}</TooltipProvider>
          </SidebarProvider>
        </ThemeProvider>
      </ApolloWrapper>
    </SessionProvider>
  );
};

export default Providers;
