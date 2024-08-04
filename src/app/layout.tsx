import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import { TRPCReactProvider } from "@/trpc/react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { SideBar } from "@/components/layouts/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layouts/header";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata = {
  title: "Echoes",
  description: "Social media app to share your friends quotes!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Analytics />
        <TRPCReactProvider>
          <TooltipProvider>
            <ThemeProvider
              defaultTheme={"system"}
              attribute={"class"}
              enableSystem
            >
              <div className="flex min-h-screen w-full flex-col bg-muted/40">
                <SideBar />
                <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
                  <Header />
                  {children}
                </div>
              </div>
            </ThemeProvider>
          </TooltipProvider>
        </TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
