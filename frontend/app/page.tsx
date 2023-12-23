import RecommendationSlider from "@/components/recommendation/RecommendationSlider";
import { Searchbar } from "@/components/search/Searchbar";

export default function Home() {
  return (
    <>
      <div className="flex justify-center h-full items-center flex-col py-4">
        <Searchbar />
        <RecommendationSlider title="Literature for you" />
      </div>
    </>
  );
}
