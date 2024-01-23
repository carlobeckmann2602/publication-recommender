"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";

function SignInSignUpButton() {
  return (
    <div className="flex gap-4 items-center">
      <Link
        href={"/signin"}
        className={buttonVariants({ variant: "default" })}
        scroll={false}
      >
        Log In
      </Link>
      <Link
        href={"/signup"}
        className={buttonVariants({ variant: "secondary" })}
        scroll={false}
      >
        Sign Up
      </Link>
    </div>
  );
}

export default SignInSignUpButton;
