import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { DOCUMENT_TYPES } from "@/constants/enums";
import SimilarSearchButton from "./SimilarSearchButton";
import LikeButton from "./LikeButton";
import Latex from "@/lib/latex-converter";

type Props = {
  id: string;
  title: string;
  authors?: string[] | null;
  date?: Date;
  link: string;
  abstract?: string | null;
  matchedSentence?: string | null;
  doi?: string[] | null;
  documentType?: DOCUMENT_TYPES | null;
  deactivateSearchSimilar?: boolean;
  className?: string;
};

export default function LiteratureCard(props: Props) {
  const domain = props.link.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );

  //const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  const doiUrl = `https://www.doi.org/${props.doi?.slice(0, 1)}`;

  let authorsString = props.authors?.slice(0, 4).join(", ");
  if (props.authors && props.authors?.length >= 5)
    authorsString = authorsString + "...";

  return (
    <Card className={`w-full ${props.className}`} id={props.id}>
      <CardHeader>
        <div className="flex flex-row gap-2">
          <div className="w-[32px] min-w-[32px]">
            {props.documentType === DOCUMENT_TYPES.PAPER && (
              <DocumentIcon className="text-2xl font-semibold leading-none w-full" />
            )}
            {props.documentType === DOCUMENT_TYPES.BOOK && (
              <BookOpenIcon className="text-2xl font-semibold leading-none w-full" />
            )}
            {props.documentType === DOCUMENT_TYPES.SPEECH && (
              <ChatBubbleBottomCenterTextIcon className="text-2xl font-semibold leading-none w-full" />
            )}
            {!props.documentType && (
              <DocumentIcon className="text-2xl font-semibold leading-none w-full" />
            )}
          </div>
          <CardTitle className="grow">
            <Latex>{props.title}</Latex>
          </CardTitle>
        </div>
        <CardDescription>
          {authorsString} {props.authors && " - "} {props.date?.getFullYear()}
          {props.date && " - "}
          <a
            href={props.link}
            className="text-blue-500 hover:text-gray-800 underline"
            target="_blank"
          >
            {domain}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
            {!props.deactivateSearchSimilar && (
              <SimilarSearchButton id={props.id} />
            )}
            {/* <TagIcon width={24} /> */}
            <LikeButton id={props.id} />
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
