import { Header } from "@/components/Header";
import { SignUpForm } from "@/components/login/SignUpForm";
import React from "react";

export default function Search() {
  return (
    <>
      <Header title="Create Account" subtitle="Please provide your details." />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full sm:w-3/4 lg:w-1/2 gap-8">
          <SignUpForm />
        </div>
      </div>
    </>
  );
}
