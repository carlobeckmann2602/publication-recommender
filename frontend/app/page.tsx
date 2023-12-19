import { Searchbar } from "@/components/search/Searchbar";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex justify-center h-full items-center flex-col py-4">
        <Searchbar />
      </div>
    </>
  );
}
