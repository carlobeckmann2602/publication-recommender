import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/navbar/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Publicationrecmd",
  description: "Find your academic publication",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-row">
            <Sidebar className="" />
            <div className="flex-grow">
              {children}
              <Toaster />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
