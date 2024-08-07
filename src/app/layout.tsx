import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { TRPCReactProvider } from "@/trpc/react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { SideBar } from "@/components/layouts/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layouts/header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Analytics } from "@vercel/analytics/react";
import { getServerAuthSession } from "@/server/auth";

export const metadata = {
  title: "Echoes",
  description: "Social media app to share your friends quotes!",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();
  const defaultTheme = session?.user?.preferences?.theme || "system";

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Analytics />
        <TRPCReactProvider>
          <TooltipProvider>
            <ThemeProvider
              defaultTheme={defaultTheme}
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
