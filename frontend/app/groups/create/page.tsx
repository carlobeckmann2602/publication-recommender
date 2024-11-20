import { Header } from "@/components/Header";
import PublicationGroupForm from "@/components/groups/PublicationGroupForm";

type Props = {
  searchParams?: Record<"callbackUrl" | "error", string>;
};

export default function PublicationGroups(props: Props) {
  return (
    <>
      <Header
        title="Create a new Group"
        subtitle="Create a new group to organise publications according to your needs, for example different topics or projects. Choose a name and color for your group to make it easier to recognise."
      />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full md:w-3/4 xl:w-1/2 gap-8">
          <PublicationGroupForm error={props.searchParams?.error} />
        </div>
      </div>
    </>
  );
}
