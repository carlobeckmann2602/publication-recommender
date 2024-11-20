import PublicationCard from "@/components/publicationCard/PublicationCard";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Suspense, useEffect, useState } from "react";
import { DOCUMENT_TYPES } from "@/constants/enums";
import PublicationCardSkeleton from "@/components/publicationCard/PublicationCardSkeleton";

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
    abstract?: string | null | undefined;
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
          <Suspense
            fallback={
              <CarouselItem className="basis-full xl:basis-1/2 items-start">
                <PublicationCardSkeleton />
              </CarouselItem>
            }
          >
            {publications.map((publication) => (
              <CarouselItem
                key={publication.id}
                className="basis-full xl:basis-1/2 items-start"
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
                  abstract={publication.abstract}
                  documentType={DOCUMENT_TYPES.PAPER}
                  disableSearchSimilar={false}
                  className="h-full"
                />
              </CarouselItem>
            ))}
          </Suspense>
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
