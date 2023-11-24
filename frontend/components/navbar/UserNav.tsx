import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";

import Link from "next/link";
import SignInSignUpButton from "@/components/login/SignInSignUpButton";
import SignOut from "@/components/login/SignOut";

export function UserNav() {
  const { data: session } = useSession();

  if (session && session.user) {
    const name = session.user.name;
    const initals = name
      .match(/(\b\S)?/g)
      ?.join("")
      ?.match(/(^\S|\S$)?/g)
      ?.join("")
      .toUpperCase();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={session.user.image} alt="profile image" />
              <AvatarFallback>{initals}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {session.user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/profile">
              <DropdownMenuItem>Profil</DropdownMenuItem>
            </Link>
            <DropdownMenuItem>Einstellungen</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <SignOut>
            <Button
              variant={"ghost"}
              className="text-sm justify-start p-2 font-normal h-auto"
            >
              Log out
            </Button>
          </SignOut>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return <SignInSignUpButton />;
}
