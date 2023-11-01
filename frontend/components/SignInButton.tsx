"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { buttonVariants } from "@/components/ui/button";

function SignInButton() {
  const { data: session } = useSession();
  console.log({ session });

  if (session && session.user)
    return (
      <div className="flex gap-4 p-8 items-center">
        <p className="text-black">{session.user.name}</p>
        <Link
          href={"/api/auth/signout"}
          className={buttonVariants({ variant: "secondary" })}
        >
          Sign Out
        </Link>
      </div>
    );

  return (
    <div className="flex gap-4 p-8 items-center">
      <Link href={"/api/auth/signin"} className={buttonVariants()}>
        Sign In
      </Link>
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
