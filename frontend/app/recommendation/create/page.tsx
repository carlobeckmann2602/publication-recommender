"use client";
import { Header } from "@/components/Header";
import DeleteButton from "@/components/DeleteButton";
import PublicationCardByIdClient from "@/components/publicationCard/PublicationCardByIdClient";
import { Button, buttonVariants } from "@/components/ui/button";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { PlusCircle, Trash2, Wand2 } from "lucide-react";
import Link from "next/link";
import { createRef, useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Searchbar } from "@/components/search/Searchbar";
import { useSticky } from "@/hook/UseSticky";

export default function RecommendationCreate() {
  const { publicationGroup, clearPublications } = useRecommendationsStore();
  const [publications, setPublications] = useState<string[]>();

  const { toast } = useToast();

  const onClearSelection = () => {
    clearPublications();
    toast({
      variant: "destructive",
      title: "Selection cleared",
      description: "Selection of publications for recommendations was cleared",
    });
  };

  useEffect(() => {
    setPublications(publicationGroup);
  }, [publicationGroup]);

  const { ref, isSticky } = useSticky();

  if (publications?.length === 0) {
    return (
      <div className="flex flex-col w-full h-full">
        <Header
          title="Create Recommendation"
          subtitle="create your recommendation based on your selection"
        />
        <div className="grow flex flex-col gap-4 justify-center items-center">
          <div className="text-2xl font-medium text-center w-full">
            You can only use this function once you have selected publications!
          </div>
          <div className="text-lg font-normal text-center w-full">
            To add publications simply press the button{" "}
            <kbd
              className={`${buttonVariants({
                variant: "secondary",
                size: "icon",
              })}`}
            >
              <PlusCircle size={20} />
            </kbd>{" "}
            on the publication you want to add.
          </div>
          <Searchbar className="my-6" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Header
        title="Create Recommendation"
        subtitle="create your recommendation based on your selection"
      />
      <div
        className={`flex flex-row justify-between w-full sticky top-0 ${
          isSticky &&
          "-mx-4 p-4 rounded-b-md bg-white dark:bg-neutral-900 border z-[51] !w-auto shadow-md"
        }`}
        ref={ref}
      >
        <DeleteButton
          onClick={onClearSelection}
          tooltipText="Delete selection"
          dialogTitle="Delete selection"
          dialogText="Do you really want to delete the selection of publication?"
        />
        <Link
          href="./create/new-recommendation"
          className={buttonVariants({
            variant: "default",
          })}
          onClick={() =>
            toast({
              title: "Recommendation created",
              description: `Recommendation created based on your ${
                publications?.length
              } selected ${
                publications?.length == 1 ? " publication" : " publications"
              }`,
            })
          }
        >
          Create Recommendation with this {publications?.length}{" "}
          {publications?.length == 1 ? " publication" : " publications"}
          <Wand2 size={20} className="ml-4" />
        </Link>
      </div>
      <div className="flex flex-row justify-between items-end gap-8 mt-4 mb-2">
        <h2 className="text-lg font-medium">
          Your selection of publications your custom recommendation would be
          based on:
        </h2>
      </div>
      <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
        {publications?.map((item) => {
          return (
            <PublicationCardByIdClient
              key={item}
              id={item}
              enableRecommendationWarning
            />
          );
        })}
      </div>
    </div>
  );
}
