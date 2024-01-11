import PublicationCard from "@/components/search/PublicationCard";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useEffect, useState } from "react";

type Props = {
  title: string;
  titleClassName?: string;
  publications: {
    __typename?: "PublicationResponseDto" | undefined;
    id: string;
    title: string;
    authors?: string[] | null | undefined;
    publicationDate?: any;
    doi: string[];
    url?: string | null | undefined;
  }[];
};

export default function RecommendationSlider({
  title,
  titleClassName,
  publications,
}: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      console.log("current");
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <>
      <div
        className={`text-2xl font-medium text-left w-full my-4 ${titleClassName}`}
      >
        {title}
      </div>
      <Carousel
        className="mx-12"
        setApi={setApi}
        plugins={[
          Autoplay({
            delay: 10000,
          }),
        ]}
      >
        <CarouselContent className="">
          {publications.map((publication) => (
            <CarouselItem
              key={publication.id}
              className="basis-full xl:basis-1/2 2xl:basis-1/3 items-start"
            >
              <PublicationCard
                key={publication.id}
                id={publication.id}
                title={publication.title}
                authors={publication.authors}
                date={
                  publication.publicationDate
                    ? new Date(publication.publicationDate)
                    : undefined
                }
                link={publication.url}
                doi={publication.doi}
                disableSearchSimilar={false}
                className="h-full"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      <div className="py-2 text-center text-sm text-muted-foreground">
        Publication {current} of {count}
      </div>
    </>
  );
}
