import NewestRecommendationSlider from "@/components/recommendation/NewestRecommendationSlider";
import { Searchbar } from "@/components/search/Searchbar";

export default function Home() {
  return (
    <>
      <div className="flex justify-center h-full items-center flex-col py-4 gap-8">
        <Searchbar />
        <div className="w-full">
          <NewestRecommendationSlider
            title="Your newest Recommendation"
            titleClassName="text-center"
          />
        </div>
      </div>
    </>
  );
}
