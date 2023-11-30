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
  ClipboardDocumentIcon,
  DocumentIcon,
  HeartIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface Props {
  title: string;
  authors?: string;
  date?: string;
  link: string;
  abstract?: string;
  matchedSentence?: string;
  doi?: string;
  documentType?: DOCUMENT_TYPES;
}

export enum DOCUMENT_TYPES {
  "PAPER" = 1,
  "BOOK" = 2,
  "SPEECH" = 3,
}

export default function LiteratureCard(props: Props) {
  const domain = props.link.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );
  const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  return (
    <Card className="w-5/6">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2 align-middle">
          {props.documentType === DOCUMENT_TYPES.PAPER && (
            <DocumentIcon width={24} />
          )}
          {props.documentType === DOCUMENT_TYPES.BOOK && (
            <BookOpenIcon width={24} />
          )}
          {props.documentType === DOCUMENT_TYPES.SPEECH && (
            <ChatBubbleBottomCenterTextIcon width={24} />
          )}
          {!props.documentType && <DocumentIcon width={24} />}
          <h2>{props.title}</h2>
        </CardTitle>
        <CardDescription>
          {props.authors} {props.authors && " - "} {props.date}
          {props.date && " - "}
          <a
            href={props.link}
            className="text-blue-500 hover:text-gray-800 underline"
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
        <div className="flex flex-row justify-between align-middle grow">
          <div className="flex flex-row gap-2">
            <ClipboardDocumentIcon width={24} />
            {/* <TagIcon width={24} /> */}
            <HeartIcon width={20} />
          </div>
          {props.doi && (
            <span>
              DOI:{" "}
              <a
                href={props.doi}
                className="text-blue-500 hover:text-gray-800 underline"
              >
                {doiCode}
              </a>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
