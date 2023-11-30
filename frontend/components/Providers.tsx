"use client";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ApolloWrapper } from "@/lib/apollo-wrapper";

type Props = {
  children: ReactNode;
};

const Providers = ({ children }: Props) => {
  return (
    <SessionProvider>
      <ApolloWrapper>{children}</ApolloWrapper>
    </SessionProvider>
  );
};

export default Providers;
