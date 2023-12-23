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
import SimilarSearchButton from "./SimilarSearchButton";
import LikeButton from "./LikeButton";
import Latex from "@/lib/latex-converter";
import { Book, File, MessageCircle } from "lucide-react";

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

export default function LiteratureCard(props: Props) {
  const domain = props.link?.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );

  //const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  const doiUrl = `https://www.doi.org/${props.doi?.slice(0, 1)}`;

  let authorsString = props.authors?.slice(0, 4).join(", ");
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
            <Latex>{props.title}</Latex>
          </CardTitle>
        </div>
        <CardDescription>
          {authorsString} {props.authors && " - "} {props.date?.getFullYear()}
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
        {props.abstract && <p>{props.abstract}</p>}
        {props.matchedSentence && (
          <div>
            <p className="font-semibold">Matched Sentence:</p>
            <span>{props.matchedSentence}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex flex-row justify-between align-middle items-end grow">
          <div className="flex flex-row">
            {!props.disableSearchSimilar && (
              <SimilarSearchButton id={props.id} />
            )}
            {/* <TagIcon width={24} /> */}
            <LikeButton
              id={props.id}
              title={props.title}
              enableWarning={props.enableLikeWarning}
            />
          </div>
          {props.doi && (
            <span className="h-fit">
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
