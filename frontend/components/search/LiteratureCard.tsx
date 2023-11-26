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
  ClipboardDocumentIcon,
  DocumentIcon,
  HeartIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface Props {
  title: string;
  authors: string;
  date: string;
  link: string;
  abstract: string;
  matchedSentence: string;
  doi: string;
  documentType: string;
}

export default function LiteratureCard(props: Props) {
  const domain = props.link.replace(
    /^(?:https?:\/\/)?(?:[^\/]+\.)?([^.\/]+\.[^.\/]+).*$/,
    "$1"
  );
  const doiCode = props.doi.replace(/(http[s]?:\/\/)?([^\/\s]+\/)(.*)/, "$3");
  return (
    <Card className="w-5/6">
      <CardHeader>
        <CardTitle className="flex flex-row gap-2 align-middle">
          <DocumentIcon width={24} /> {props.title}
        </CardTitle>
        <CardDescription>
          {props.authors} – {props.date} –{" "}
          <a
            href={props.link}
            className="text-blue-500 hover:text-gray-800 underline"
          >
            {domain}
          </a>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p>{props.abstract}</p>
        <div>
          <p className="font-semibold">Matched Sentence:</p>
          <span>{props.matchedSentence}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-row justify-between align-middle grow">
          <div className="flex flex-row gap-2">
            <ClipboardDocumentIcon width={24} />
            {/* <TagIcon width={24} /> */}
            <HeartIcon width={20} />
          </div>
          <span>
            DOI:{" "}
            <a
              href={props.doi}
              className="text-blue-500 hover:text-gray-800 underline"
            >
              {doiCode}
            </a>
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
