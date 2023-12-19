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
            <div className="flex-grow flex px-6 md:px-8 lg:px-12 justify-center">
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
