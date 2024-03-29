import React from "react";
import Modal from "@/components/Modal";
import { LogInForm } from "@/components/login/LogInForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModalCloseButton from "@/components/ModalCloseButton";

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
};

export default function LogInModal(props: Props) {
  return (
    <Modal>
      <Card className="shadow-lg relative overflow-auto max-h-[95vh]">
        <CardHeader>
          <ModalCloseButton />
          <CardTitle className="text-center">Log In</CardTitle>
          <CardDescription className="text-center">
            Please enter your details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col w-full gap-6">
            <LogInForm
              error={props.searchParams?.error}
              callbackUrl={props.searchParams?.callbackUrl}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </Modal>
  );
}
