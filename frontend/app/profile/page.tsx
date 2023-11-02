"use client";
import { useSession } from "next-auth/react";

export default function Profile() {
  const { data: session } = useSession();
  console.log({ session });
  return <h1>Profil</h1>;
}
