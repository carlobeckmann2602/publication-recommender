"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { useSession } from "next-auth/react";

import Link from "next/link";
import SignOut from "@/components/login/SignOut";
import { UserPlus } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";

export default function UserMenu() {
  const { isCollapsed } = useContext(SidebarContext);
  const { data: session } = useSession();
  const pathname = usePathname();
  let initals: string | undefined = "";

  if (session && session.user) {
    const name = session.user.name;
    initals = name
      .match(/(\b\S)?/g)
      ?.join("")
      ?.match(/(^\S|\S$)?/g)
      ?.join("")
      .toUpperCase();
  }

  return (
    <Menubar className="h-fit p-0 border-none bg-transparent">
      <MenubarMenu>
        <MenubarTrigger
          className={`flex flex-row gap-4 items-center justify-start h-16 w-full p-2 cursor-pointer hover:bg-muted hover:outline-none hover:ring-2 hover:ring-ring hover:ring-offset-2 ${
            isCollapsed && "h-16 w-16 rounded-full justify-center"
          } ${
            (pathname === "/profile" || pathname === "/profile/settings") &&
            "bg-muted"
          }`}
        >
          <Avatar className="h-14 w-14 aspect-square">
            <AvatarImage
              src={session ? session.user.image : ""}
              alt="profile image"
            />
            <AvatarFallback className="bg-neutral-500 text-neutral-50 text-lg">
              {session ? initals : <UserPlus size={24} />}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex flex-col items-start space-y-1 transition-all duration-700 ${
              isCollapsed && "hidden"
            }`}
          >
            <p className="text-sm font-medium leading-none">
              {session ? session.user.name : "Log in"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session ? session.user.email : "Account"}
            </p>
          </div>
        </MenubarTrigger>
        <MenubarContent>
          {session ? (
            <>
              <Link href="/profile">
                <MenubarItem className="cursor-pointer">Profile</MenubarItem>
              </Link>
              <Link href="/profile/settings">
                <MenubarItem className="cursor-pointer">Settings</MenubarItem>
              </Link>
              <MenubarSeparator />
              <SignOut>
                <Button
                  variant={"ghost"}
                  className="text-sm justify-start px-2 py-1.5 font-normal h-auto"
                >
                  Log out
                </Button>
              </SignOut>
            </>
          ) : (
            <>
              <Link href={"/signin"} scroll={false}>
                <MenubarItem className="cursor-pointer">Log in</MenubarItem>
              </Link>
              <Link href={"/signup"} scroll={false}>
                <MenubarItem className="cursor-pointer">Sign up</MenubarItem>
              </Link>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
