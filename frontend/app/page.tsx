import { Searchbar } from "@/components/Searchbar";
import LiteratureCard from "@/components/search/LiteratureCard";

export default function Home() {
  const mockupCard = {
    title: "Correct use of repeated measures analysis of variance",
    authors: "E Park, M Cho, CS Ki",
    date: "2021",
    link: "https://synapse.koreamed.org/articles/1011521",
    abstract:
      "In biomedical research, researchers frequently use statistical procedures such as the t-test, standard analysis of variance (ANOVA), or the repeated measures ANOVA to compare ...",
    matchedSentence:
      "Lorem ipsum dolor sit amet consectetur. Volutpat massa dolor nunc quis lorem.",
    doi: "https://doi.org/10.3343/kjlm.2009.29.1.1",
    documentType: "paper",
  };

  return (
    <div className="flex justify-center grow items-center flex-col">
      <Searchbar></Searchbar>
      <LiteratureCard {...mockupCard} />
    </div>
  );
}
