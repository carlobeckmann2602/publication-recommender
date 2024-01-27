import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "../ui/skeleton";

type Props = {
  className?: string;
};

export default function PublicationCardSkeleton(props: Props) {
  return (
    <Card className={`w-full flex flex-col ${props.className}`}>
      <CardHeader>
        <div className="flex flex-row gap-2">
          <Skeleton className="h-12 w-12 rounded-full" />
          <CardTitle className="grow">
            <Skeleton className="h-12 w-full" />
          </CardTitle>
        </div>
        <CardDescription>
          <Skeleton className="h-4 w-4/5" />
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow gap-4">
        <Skeleton className="h-32 w-full" />
        {/*<div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-full" />
        </div> */}
      </CardContent>
      <CardFooter>
        <div className="flex flex-row gap-4 justify-between align-middle items-end grow">
          <div className="flex flex-row gap-1">
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardFooter>
    </Card>
  );
}
