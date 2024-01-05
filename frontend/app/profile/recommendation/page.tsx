"use client";
import { Header } from "@/components/Header";
import useRecommendationsStore from "@/stores/recommendationsStore";
import { useEffect, useState } from "react";

export default function Recommendation() {
  const { publicationGroup } = useRecommendationsStore();
  const [publications, setPublications] = useState<string[]>();

  useEffect(() => {
    setPublications(publicationGroup);
  }, [publicationGroup]);

  return (
    <div>
      <Header
        title="Recommendation History"
        subtitle="find your recommendations here"
      />
      <div className="grid gap-4 grid-cols-1 py-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"></div>
    </div>
  );
}
