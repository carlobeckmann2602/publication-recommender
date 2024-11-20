"use client";
import { Header } from "@/components/Header";
import DeleteButton from "@/components/DeleteButton";
import PublicationCardByIdClient from "@/components/publicationCard/PublicationCardByIdClient";
import { buttonVariants } from "@/components/ui/button";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { PlusCircle, Wand2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Searchbar } from "@/components/search/Searchbar";
import { useSticky } from "@/hooks/UseSticky";
import useOperatingSystem from "@/hooks/UseOperatingSystem";
import CardViewToggle from "@/components/CardViewToggle";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function RecommendationCreate() {
  const { recommendationGroup, clearPublications } = useRecommendationsStore();
  const [publications, setPublications] = useState<string[]>();
  const { isMobile } = useOperatingSystem();
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
    setPublications(recommendationGroup);
  }, [recommendationGroup]);

  const { ref, isSticky } = useSticky();

  if (!publications || publications.length === 0) {
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
    <div className="flex flex-col h-full">
      <Header
        title="Create Recommendation"
        subtitle="create your recommendation based on your selection"
      />
      <Tabs defaultValue="grid" className="w-full h-full grow flex flex-col">
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-between w-full sticky top-0 z-40 ${
            isSticky &&
            "-mx-4 p-4 rounded-b-md bg-background border !w-auto shadow-md"
          }`}
          ref={ref}
        >
          <DeleteButton
            onClick={onClearSelection}
            icon
            text={isMobile ? "Delete selection" : undefined}
            tooltipText="Delete selection"
            dialogTitle="Delete selection"
            dialogText="Do you really want to delete the selection of publication?"
          />
          <div className="sm:flex grow hidden" />
          <Link
            href="./create/new-recommendation?temp=true"
            className={buttonVariants({
              variant: "default",
              className: "h-fit !whitespace-normal",
            })}
            style={{ minHeight: "2.5rem" }}
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
          <CardViewToggle disableRoom />
        </div>
        <div className="flex flex-row justify-between items-end gap-8 mt-4 mb-2">
          <h2 className="text-lg font-medium">
            Your selection of publications your custom recommendation would be
            based on:
          </h2>
        </div>
        <TabsContent value="grid">
          <div className="grid gap-4 grid-cols-1 py-4 xl:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4">
            {publications?.map((item) => {
              return <PublicationCardByIdClient key={item} id={item} />;
            })}
          </div>
        </TabsContent>
        <TabsContent value="list">
          <div className="my-4 flex flex-col gap-4 w-full">
            {publications?.map((item) => {
              return <PublicationCardByIdClient key={item} id={item} />;
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
