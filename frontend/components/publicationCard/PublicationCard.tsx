import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DOCUMENT_TYPES } from "@/constants/enums";
import SimilarSearchButton from "@/components/publicationCard/SimilarSearchButton";
import LikeButton from "@/components/publicationCard/LikeButton";
import Latex from "@/lib/latex-converter";
import { Book, File, MessageCircle } from "lucide-react";
import Link from "next/link";
import CitationButton from "@/components/publicationCard/CitationButton";
import PublicationGroupButton from "@/components/publicationCard/PublicationGroupButton";
import PublicationGroupBadges from "@/components/publicationCard/PublicationCardBadges";

type Props = {
  id: string;
  title: string;
  authors?: string[] | null;
  date?: Date;
  link?: string | null;
  abstract?: string | null;
  matchedSentence?: string | null;
  doi?: string[] | null;
  documentType?: DOCUMENT_TYPES | null;
  disableSearchSimilar?: boolean;
  enableLikeWarning?: boolean;
  className?: string;
};

export default function PublicationCard(props: Props) {
  const domain = props.link?.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );

  //const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  const doiUrl = `https://www.doi.org/${props.doi?.slice(0, 1)}`;

  const authorAmount = 3;

  let authorsString = props.authors?.slice(0, authorAmount).join(", ");
  if (props.authors && props.authors?.length >= authorAmount)
    authorsString = authorsString + "...";

  return (
    <Card
      className={`@container/card contain-layout relative w-full flex flex-col z-10 ${props.className}`}
      id={props.id}
    >
      <CardHeader>
        <div className="flex flex-row gap-2">
          {props.documentType && (
            <div className="hidden @3xl/card:block w-[32px] min-w-[32px]">
              {props.documentType === DOCUMENT_TYPES.PAPER && (
                <File size={32} />
              )}
              {props.documentType === DOCUMENT_TYPES.BOOK && <Book size={32} />}
              {props.documentType === DOCUMENT_TYPES.SPEECH && (
                <MessageCircle size={32} />
              )}
            </div>
          )}
          <CardTitle className="grow text-lg @3xl/card:text-2xl">
            <Link
              href={props.link ?? ""}
              target="_blank"
              className="hover:underline"
            >
              <Latex>{props.title}</Latex>
            </Link>
          </CardTitle>
        </div>
        <CardDescription className="text-xs @3xl/cardtext-sm">
          {authorsString} {authorsString && " - "} {props.date?.getFullYear()}
          {props.date && " - "}
          {props.link && (
            <a
              href={props.link}
              className="text-blue-500 hover:text-gray-800 underline"
              target="_blank"
            >
              {domain}
            </a>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-4">
        {props.abstract && (
          <p className="line-clamp-3 text-ellipsis">
            <Latex>{props.abstract}</Latex>
          </p>
        )}
        {props.matchedSentence && (
          <div>
            <p className="font-semibold">Matched Sentence:</p>
            <span>{props.matchedSentence}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-col-reverse @3xl/card:flex-row gap-4 justify-between @3xl/card:items-center grow">
          <div className="flex flex-row gap-1">
            {!props.disableSearchSimilar && (
              <SimilarSearchButton id={props.id} />
            )}
            <LikeButton
              id={props.id}
              title={props.title}
              enableWarning={props.enableLikeWarning}
            />
            <CitationButton
              id={props.id}
              title={props.title}
              doi={props.doi}
              authors={props.authors}
              date={props.date}
              link={props.link}
            />
            <PublicationGroupButton id={props.id} title={props.title} />
          </div>
          <PublicationGroupBadges id={props.id} />
          {props.doi && props.doi[0] && (
            <p className="h-fit text-sm @3xl/cardtext-body min-w-56">
              DOI:{" "}
              <a
                href={doiUrl}
                className="text-blue-500 hover:text-gray-800 underline"
                target="_blank"
              >
                {props.doi.slice(0, 1)}
              </a>
            </p>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
