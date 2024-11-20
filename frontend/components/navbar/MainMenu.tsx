"use client";
import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SvgSparkleHistory from "@/assets/svg/SvgSparkleHistory";
import SvgSparkleHistoryFill from "@/assets/svg/SvgSparkleHistoryFill";
import PublicationGroupMenu from "@/components/navbar/PublicationGroupMenu";

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
    icon: <SvgSparkleHistory size={24} />,
    activeIcon: <SvgSparkleHistoryFill size={24} />,
    onlyLoggedIn: true,
  },
];

export default function MainMenu({
  clickCallback,
  isCollapsed,
}: {
  clickCallback: () => void;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const session = useSession();

  if (isCollapsed)
    return (
      <nav
        className={
          "flex flex-col gap-2 items-center w-full grow px-6 pb-1 overflow-y-auto"
        }
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
                  onClick={clickCallback}
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
        <PublicationGroupMenu
          clickCallback={clickCallback}
          isCollapsed={isCollapsed}
        />
      </nav>
    );

  return (
    <nav
      className={
        "flex flex-col gap-2 items-center w-full grow px-6 overflow-y-auto"
      }
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
            onClick={clickCallback}
          >
            {pathname === href ? activeIcon : icon}
            <span className="transition-all duration-700">{name}</span>
          </Link>
        );
      })}
      <PublicationGroupMenu
        clickCallback={clickCallback}
        isCollapsed={isCollapsed}
      />
    </nav>
  );
}
