import PublicationCardSkeleton from "../publicationCard/PublicationCardSkeleton";

type Props = {
  publicationAmount: number;
};

export default async function SearchResultSkeleton({
  publicationAmount,
}: Props) {
  return (
    <>
      {[...Array(publicationAmount)].forEach((item, index) => (
        <PublicationCardSkeleton />
      ))}
    </>
  );
}
