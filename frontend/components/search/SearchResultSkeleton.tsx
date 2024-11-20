import PublicationCardSkeleton from "@/components/publicationCard/PublicationCardSkeleton";

type Props = {
  publicationAmount: number;
};

export default async function SearchResultSkeleton({
  publicationAmount,
}: Props) {
  return (
    <>
      {[...Array(publicationAmount)].map((_, index) => (
        <PublicationCardSkeleton key={index} />
      ))}
    </>
  );
}
