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
import AddToRecommendationButton from "@/components/publicationCard/AddRemovetoSelectionButton";
import Link from "next/link";

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
  enableRecommendationWarning?: boolean;
  className?: string;
};

export default function PublicationCard(props: Props) {
  const domain = props.link?.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );

  //const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  const doiUrl = `https://www.doi.org/${props.doi?.slice(0, 1)}`;

  const abstractWordAmount = 50;
  const authorAmount = 3;

  let authorsString = props.authors?.slice(0, authorAmount).join(", ");
  if (props.authors && props.authors?.length >= 5)
    authorsString = authorsString + "...";

  return (
    <Card className={`w-full flex flex-col ${props.className}`} id={props.id}>
      <CardHeader>
        <div className="flex flex-row gap-2">
          {props.documentType && (
            <div className="w-[32px] min-w-[32px]">
              {props.documentType === DOCUMENT_TYPES.PAPER && (
                <File size={32} />
              )}
              {props.documentType === DOCUMENT_TYPES.BOOK && <Book size={32} />}
              {props.documentType === DOCUMENT_TYPES.SPEECH && (
                <MessageCircle size={32} />
              )}
            </div>
          )}
          <CardTitle className="grow">
            <Link
              href={props.link ?? ""}
              target="_blank"
              className="hover:underline"
            >
              <Latex>{props.title}</Latex>
            </Link>
          </CardTitle>
        </div>
        <CardDescription>
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
          <p>
            <Latex>
              {props.abstract
                .split(" ")
                .splice(0, abstractWordAmount)
                .join(" ") +
                (props.abstract.length > abstractWordAmount ? "..." : "")}
            </Latex>
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
        <div className="flex flex-row gap-4 justify-between align-middle items-end grow">
          <div className="flex flex-row gap-1">
            {!props.disableSearchSimilar && (
              <SimilarSearchButton id={props.id} />
            )}
            {/* <TagIcon width={24} /> */}
            <LikeButton
              key={props.id}
              id={props.id}
              title={props.title}
              enableWarning={props.enableLikeWarning}
            />
            <AddToRecommendationButton
              id={props.id}
              title={props.title}
              enableWarning={props.enableRecommendationWarning}
            />
          </div>
          {props.doi && props.doi[0] && (
            <span className="h-fit text-right">
              DOI:{" "}
              <a
                href={doiUrl}
                className="text-blue-500 hover:text-gray-800 underline"
                target="_blank"
              >
                {props.doi.slice(0, 1)}
              </a>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
