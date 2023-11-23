import { Searchbar } from "@/components/Searchbar";
import { getSession } from "next-auth/react";

export default function Home() {
  return (
    <div className="flex justify-center grow items-center flex-col">
      <Searchbar></Searchbar>
    </div>
  );
}
