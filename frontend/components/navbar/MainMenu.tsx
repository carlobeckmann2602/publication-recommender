"use client";
import Link from "next/link";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { buttonVariants } from "../ui/button";
import { useContext } from "react";
import { SidebarContext } from "@/context/SidebarContext";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import sparkelClockIcon from "@/public/svg/sparkle-clock.svg";
import sparkelClockIconFill from "@/public/svg/sparkle-clock-fill.svg";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

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
    name: "Recommendation History",
    href: "/profile/recommendation",
    icon: <Image src={sparkelClockIcon} alt="Recommendation History" />,
    activeIcon: (
      <Image src={sparkelClockIconFill} alt="Recommendation History" />
    ),
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

  if (isCollapsed)
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
            <Tooltip key={name}>
              <TooltipTrigger asChild>
                <Link
                  href={href}
                  className={`${
                    pathname === href
                      ? buttonVariants({
                          variant: "secondary",
                        })
                      : buttonVariants({
                          variant: "ghost",
                        })
                  }  h-12 flex gap-4 w-12 justify-center !p-2
              `}
                >
                  {pathname === href ? activeIcon : icon}
                  <span className="transition-all duration-700 hidden">
                    {name}
                  </span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={10}>
                {name}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    );

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
            } w-full h-12 flex gap-4 !justify-start`}
          >
            {pathname === href ? activeIcon : icon}
            <span className="transition-all duration-700">{name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
