"use client";
import { signIn } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { Button, buttonVariants } from "@/components/ui/button";

function SignInSignUpButton() {
  return (
    <div className="flex gap-4 items-center">
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

export default SignInSignUpButton;
