"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";

function SignInButton() {
  const { data: session } = useSession();
  console.log({ session });

  if (session && session.user)
    return (
      <div className="flex gap-4 p-8 items-center">
        <p className="text-black">{session.user.name}</p>
        <Button variant="secondary" onClick={() => signOut()}>
          Sign Out
        </Button>
      </div>
    );

  return (
    <div className="flex gap-4 p-8 items-center">
      <Button onClick={() => signIn()}>Sign In</Button>
      <Link
        href={"/signup"}
        className={buttonVariants({ variant: "secondary" })}
      >
        Sign Up
      </Link>
    </div>
  );
}

export default SignInButton;
