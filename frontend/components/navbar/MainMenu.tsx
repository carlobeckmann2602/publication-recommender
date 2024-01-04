"use client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonVariants } from "../ui/button";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { Heart, Sparkle } from "lucide-react";
import { useSession } from "next-auth/react";

const menuItems = [
  {
    name: "Home",
    href: "/",
    icon: <Image src="/logo.svg" alt="logo" width={24} height={24} />,
    activeIcon: <Image src="/logo.svg" alt="logo" width={24} height={24} />,
    onlyLoggedIn: false,
  },
  {
    name: "Favorites",
    href: "/profile/favorites",
    icon: <Heart size={24} />,
    activeIcon: <Heart size={24} color="red" fill="red" />,
    onlyLoggedIn: true,
  },
  {
    name: "Recommendation",
    href: "/profile/recommendation",
    icon: <Sparkle size={24} />,
    activeIcon: <Sparkle size={24} fill="" />,
    onlyLoggedIn: true,
  },
];

export default function MainMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { isCollapsed } = useContext(SidebarContext);
  const pathname = usePathname();
  const session = useSession();

  return (
    <nav
      className={cn(
        "flex flex-col gap-2 items-center w-full flex-1",
        className
      )}
      {...props}
    >
      {menuItems.map(({ name, href, icon, activeIcon, onlyLoggedIn }) => {
        if (onlyLoggedIn && session.status != "authenticated") return;
        return (
          <Link
            key={name}
            href={href}
            className={`${
              pathname === href
                ? buttonVariants({
                    variant: "secondary",
                  })
                : buttonVariants({
                    variant: "ghost",
                  })
            } w-full h-12 flex gap-4 ${
              isCollapsed ? "w-12 justify-center !p-2" : "!justify-start"
            }`}
          >
            {pathname === href ? activeIcon : icon}
            <span
              className={`transition-all duration-700 ${
                isCollapsed ? "hidden" : ""
              }`}
            >
              {name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
