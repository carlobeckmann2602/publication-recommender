"use client";
import { Header } from "@/components/Header";
import PublicationCardByIdClient from "@/components/search/PublicationCardByIdClient";
import { Button } from "@/components/ui/button";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { useEffect, useState } from "react";

export default function RecommendationCreate() {
  const { publicationGroup } = useRecommendationsStore();
  const [publications, setPublications] = useState<string[]>();

  useEffect(() => {
    setPublications(publicationGroup);
  }, [publicationGroup]);

  if (publications?.length === 0) {
    return (
      <div>
        <Header
          title="Create Recommendation"
          subtitle="create your recommendation based on your selection"
        />
        <div className="text-center my-8">
          You can only use this function once you have selected publications!
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header
        title="Create Recommendation"
        subtitle="create your recommendation based on your selection"
      />
      <div className="grid gap-4 grid-cols-1 py-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
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
      <Button className="fixed bottom-4 left-[50%] shadow-md">
        Create Recommendation with this {publications?.length} publications
      </Button>
    </div>
  );
}
