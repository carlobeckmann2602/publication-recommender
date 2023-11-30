import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

type Props = {
  totalResults: number;
  resultsPerPage: number;
  selectedPage: number;
  url: string;
};

export default function Pagination(props: Props) {
  const pageNumbers = [];

  const selectedPageNumber = +props.selectedPage + 1;

  let dotsBefore = false;
  let dotsAfter = false;
  const pagesCount = Math.ceil(props.totalResults / props.resultsPerPage);

  if (pagesCount > 5) {
    if (selectedPageNumber <= 3) {
      dotsAfter = true;
      for (let i = 1; i <= 5; i++) {
        pageNumbers.push(i);
      }
    } else if (selectedPageNumber >= pagesCount - 2) {
      dotsBefore = true;
      for (let i = pagesCount - 4; i <= pagesCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      dotsAfter = true;
      dotsBefore = true;
      for (let i = selectedPageNumber - 2; i <= selectedPageNumber + 2; i++) {
        pageNumbers.push(i);
      }
    }
  }

  return (
    <div className="p-4">
      <ul className="flex flex-row gap-4">
        {props.selectedPage > 0 && (
          <li>
            <Link
              href={`${props.url}&offset=${props.selectedPage - 1}`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <ChevronLeftIcon width={24} height={24} />
            </Link>
          </li>
        )}
        {dotsBefore && (
          <span className="justify-center items-center flex">...</span>
        )}
        {pageNumbers.map((number) => (
          <li key={number}>
            {number == selectedPageNumber && (
              <Button variant={"outline"}>{number}</Button>
            )}
            {number != selectedPageNumber && (
              <Link
                href={`${props.url}&offset=${number - 1}`}
                className={buttonVariants({ variant: "ghost" })}
              >
                {number}
              </Link>
            )}
          </li>
        ))}
        {dotsAfter && (
          <span className="justify-center items-center flex">...</span>
        )}
        {props.selectedPage < pagesCount - 1 && (
          <li>
            <Link
              href={`${props.url}&offset=${+props.selectedPage + 1}`}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
            >
              <ChevronRightIcon width={24} height={24} />
            </Link>
          </li>
        )}
      </ul>
    </div>
  );
}
