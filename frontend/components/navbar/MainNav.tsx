import Link from "next/link";

import { cn } from "@/lib/utils";
import Image from "next/image";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        <Image src="/logo.svg" alt="logo" width={35} height={35} />
      </Link>
    </nav>
  );
}
