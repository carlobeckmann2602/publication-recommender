"use client";
import { Header } from "@/components/Header";
import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
import LiteratureCard from "@/components/search/LiteratureCard";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { useEffect, useState } from "react";

export default function RecommendationCreate() {
  const { publicationGroup } = useRecommendationsStore();
  const [publications, setPublications] = useState<string[]>();

  useEffect(() => {
    setPublications(publicationGroup);
  }, [publicationGroup]);

  return (
    <div>
      <Header
        title="Create Recommendation"
        subtitle="create your recommendation based on your selection"
      />
      <div className="grid gap-4 grid-cols-1 py-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {JSON.stringify(publications, null, 2)}
      </div>
    </div>
  );
}
