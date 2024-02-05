"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

import { useSession } from "next-auth/react";

import Link from "next/link";
import SignOut from "@/components/login/SignOut";
import { User } from "lucide-react";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";

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

  const { setTheme } = useTheme();

  return (
    <Menubar className="h-fit p-0 border-none bg-transparent justify-center">
      <MenubarMenu>
        <MenubarTrigger
          className={`flex flex-row gap-4 items-center justify-start h-16 w-full p-2 cursor-pointer hover:bg-muted hover:outline-none hover:ring-2 hover:ring-ring hover:ring-offset-2 ${
            isCollapsed && "h-16 w-16 rounded-full justify-center"
          } ${
            (pathname === "/profile" || pathname === "/profile/settings") &&
            "bg-muted"
          }`}
        >
          <Avatar className="h-12 w-12 aspect-square">
            <AvatarImage
              src={session ? session.user.image : ""}
              alt="profile image"
            />
            <AvatarFallback className="bg-neutral-500 text-foreground text-lg">
              {session ? initals : <User size={24} />}
            </AvatarFallback>
          </Avatar>
          <div
            className={`flex flex-col items-start space-y-1 transition-all duration-700 ${
              isCollapsed && "hidden"
            }`}
          >
            <p className="text-sm font-medium leading-none text-left">
              {session ? session.user.name : "Sign up/Log in"}
            </p>
            <p className="text-xs leading-none text-left text-muted-foreground">
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
              {/* <Link href="/profile/settings">
                <MenubarItem className="cursor-pointer">Settings</MenubarItem>
              </Link> */}
              <MenubarSub>
                <MenubarSubTrigger>Theme</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setTheme("light")}>
                    Light
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme("dark")}>
                    Dark
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme("system")}>
                    System
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarSeparator />
              <SignOut>
                <Button
                  variant={"ghost"}
                  className="text-sm justify-start px-2 py-1.5 font-normal h-auto"
                >
                  Sign out
                </Button>
              </SignOut>
            </>
          ) : (
            <>
              <Link href={"/login"} scroll={false}>
                <MenubarItem className="cursor-pointer">Log in</MenubarItem>
              </Link>
              <Link href={"/signup"} scroll={false}>
                <MenubarItem className="cursor-pointer">Sign up</MenubarItem>
              </Link>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>Theme</MenubarSubTrigger>
                <MenubarSubContent>
                  <MenubarItem onClick={() => setTheme("light")}>
                    Light
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme("dark")}>
                    Dark
                  </MenubarItem>
                  <MenubarItem onClick={() => setTheme("system")}>
                    System
                  </MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
            </>
          )}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
