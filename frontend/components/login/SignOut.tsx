import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

interface Props {
  children: ReactNode;
}

export default function SignOut({ children }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild className="w-full">
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Are you sure to log out?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose className="w-1/2" asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button className="w-1/2" type="submit" onClick={() => signOut()}>
            Log out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
