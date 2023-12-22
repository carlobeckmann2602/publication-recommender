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
          <div className="min-h-screen flex flex-row">
            <Sidebar className="" />
            <div
              id="content"
              className="flex-grow flex pr-6 md:pr-8 lg:pr-12 pl-[19.5rem] md:pl-80 lg:pl-[21rem] justify-center w-screen"
            >
              <div className="max-w-7xl flex-grow">{props.children}</div>
              <Toaster />
            </div>
          </div>
          {props.modal}
        </Providers>
      </body>
    </html>
  );
}
