import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

type Props = {
  children: React.ReactNode;
};

export default function SignOut({ children }: Props) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className="w-full">
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Logout</AlertDialogTitle>
        </AlertDialogHeader>
        Are you sure you want to sign out?
        <AlertDialogFooter className="sm:justify-start">
          <AlertDialogCancel className="w-1/2" asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction className="w-1/2" asChild>
            <Button className="w-1/2" type="submit" onClick={() => signOut()}>
              Sign out
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
