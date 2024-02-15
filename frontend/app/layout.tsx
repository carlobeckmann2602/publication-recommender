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

export default function RootLayout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head></head>
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            <Sidebar className="" />
            <div
              id="content"
              className="flex-grow flex pr-5 md:pr-7 lg:pr-11 pl-[19.25rem] md:[19.75rem] lg:pl-[20.75rem] justify-center"
            >
              <div className="w-full max-w-7xl px-1 min-h-screen">
                {props.children}
              </div>
              <Toaster />
            </div>
          </div>
          {props.modal}
        </Providers>
      </body>
    </html>
  );
}
