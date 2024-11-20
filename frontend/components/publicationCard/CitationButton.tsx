"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Quote } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Props = {
  id: string;
  title: string;
  authors?: string[] | null;
  date?: Date;
  link?: string | null;
  doi?: string[] | null;
};

export default function CitationButton(props: Props) {
  const { toast } = useToast();

  const generateCitation = (format: String) => {
    const authors = props.authors?.join(" and ") || "Unknown author";
    const year = props.date?.getFullYear();
    const title = props.title;
    const link = props.link;
    const doi = props.doi?.[0];

    let bibTexHandle;
    if (props.authors && props.authors.length > 0) {
      const firstAuthor = props.authors[0];
      const nameParts = firstAuthor.split(" ");
      const firstNameInitial = nameParts[0][0];
      const lastName = nameParts.slice(-1)[0];
      bibTexHandle = `${firstNameInitial}${lastName}${
        props.authors.length > 1 ? "EtAl" : ""
      }${year}`;
    } else {
      bibTexHandle = `UnknownAuthor${year}`;
    }

    switch (format) {
      case "BibTeX":
        return `@article{${bibTexHandle},
                author = {${authors}},
                title = {${title}},
                year = {${year}},
                url = {${link}},
                doi = {${doi}}
                }`;
      case "Harvard":
        return `${authors} (${year}). ${title}. Available at: ${link}.`;
      case "IEEE":
        return `${authors}, "${title}," ${link},  ${year}. doi: ${doi}`;
      default:
        return "Choose correct citation style.";
    }
  };

  const [citation, setCitation] = useState(generateCitation("BibTeX"));

  const handleFormatChange = (format: string) => {
    const citation = generateCitation(format);
    setCitation(citation);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(citation);
    toast({
      title: "Copied to clipboard.",
    });
  };

  return (
    <>
      <Dialog>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger
              asChild
              onClick={() => {
                handleFormatChange("BibTeX");
              }}
            >
              <Button variant="ghost" size="icon">
                <Quote size={24} />
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent align="start" sideOffset={10}>
            Cite publication
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Citation</DialogTitle>
            <DialogClose className="w-1/2" asChild />
          </DialogHeader>
          <Tabs defaultValue="bibtex" orientation="vertical">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="bibtex"
                onClick={() => {
                  handleFormatChange("BibTeX");
                }}
              >
                BibTeX
              </TabsTrigger>
              <TabsTrigger
                value="harvard"
                onClick={() => {
                  handleFormatChange("Harvard");
                }}
              >
                Harvard
              </TabsTrigger>
              <TabsTrigger
                value="ieee"
                onClick={() => {
                  handleFormatChange("IEEE");
                }}
              >
                IEEE
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="bibtex"
              className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-[250px] overflow-y-auto"
            >
              <pre className="h-full whitespace-pre-wrap break-words">
                {generateCitation("BibTeX")}
              </pre>
            </TabsContent>
            <TabsContent
              value="harvard"
              className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-[250px] overflow-y-auto"
            >
              <pre className="h-full whitespace-pre-wrap break-words">
                {generateCitation("Harvard")}
              </pre>
            </TabsContent>
            <TabsContent
              value="ieee"
              className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-[250px] overflow-y-auto"
            >
              <pre className="h-full whitespace-pre-wrap break-words">
                {generateCitation("IEEE")}
              </pre>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button onClick={copyToClipboard} className="w-full">
              Copy to clipboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
