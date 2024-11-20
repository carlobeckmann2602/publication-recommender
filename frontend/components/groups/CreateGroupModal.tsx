"use client";

import React, { useState } from "react";
import Modal from "@/components/Modal";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ModalCloseButton from "@/components/ModalCloseButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import PublicationGroupForm from "@/components/groups/PublicationGroupForm";

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
  initialPapers?: string[];
  withNavigation?: boolean;
  onClose?: () => void;
};

export default function CreatePublicationGroupModal(props: Props) {
  const [errorMsg] = useState(props.searchParams?.error);

  return (
    <Modal>
      <Card className="shadow-lg relative overflow-auto max-h-[95vh]">
        <CardHeader>
          <ModalCloseButton onClose={props.onClose} />
          <CardTitle className="text-center">Create a new Group</CardTitle>
          <CardDescription className="text-center">
            Create a new group to organise publications according to your needs,
            for example different topics or projects. Choose a name and color
            for your group to make it easier to recognise.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col w-full gap-6">
            <PublicationGroupForm
              initialPapers={props.initialPapers}
              withNavigation={props.withNavigation}
              onClose={props.onClose}
            />
            {!!errorMsg && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </Modal>
  );
}
