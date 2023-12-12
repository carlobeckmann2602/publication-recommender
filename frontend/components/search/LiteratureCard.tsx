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

type Props = {
  id: string;
  title: string;
  authors?: string | null;
  date?: Date;
  link: string;
  abstract?: string | null;
  matchedSentence?: string | null;
  doi?: string | null;
  documentType?: DOCUMENT_TYPES | null;
};

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
  //const doiCode = props.doi?.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  const doiUrl = `https://www.doi.org/${props.doi}`;
  return (
    <Card className="w-5/6" id={props.id}>
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
          {props.title}
        </CardTitle>
        <CardDescription>
          {props.authors} {props.authors && " - "} {props.date?.getFullYear()}
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
                href={doiUrl}
                className="text-blue-500 hover:text-gray-800 underline"
                target="_blank"
              >
                {props.doi}
              </a>
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
