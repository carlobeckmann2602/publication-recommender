"use client"
import React from "react";
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Navbar(){
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
        <NavigationMenuLink href="/">
            Home
          </NavigationMenuLink>
          <NavigationMenuLink href="/profile">
            Profil
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}