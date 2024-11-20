import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/navbar/Sidebar";
import type { Viewport } from "next";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Papermatcher",
  description: "Find your academic publication",
};

export default function RootLayout(props: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head></head>
      <body className={inter.className}>
        <Providers>
          <div className="max-w-full flex flex-row">
            <Sidebar className="basis-0" />
            <div
              id="content"
              className="w-full flex justify-center grow basis-0"
            >
              <div className="w-full px-4 lg:px-8 min-h-[100dvh]">
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
