import { Searchbar } from "@/components/search/Searchbar";
import LiteratureCard, {
  DOCUMENT_TYPES,
} from "@/components/search/LiteratureCard";

export default function Home() {
  return (
    <div className="flex justify-center grow items-center flex-col py-4">
      <Searchbar />
      <div className="flex flex-col items-center py-6 w-full gap-4"></div>
    </div>
  );
}
