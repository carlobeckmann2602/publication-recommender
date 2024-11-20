import { Header } from "@/components/Header";

export default function PublicationGroups() {
  return (
    <>
      <Header
        title="Your Groups"
        subtitle="Save and organize publications to your needs."
      />
      <div className="flex justify-center p-8">
        <div className="flex flex-col w-full md:w-3/4 xl:w-1/2 gap-8"></div>
      </div>
    </>
  );
}
