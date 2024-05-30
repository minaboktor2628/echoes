"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const GithubLogInButton = () => {
  const { data: session, status } = useSession();

  return (
    <Button
      onClick={() =>
        status === "authenticated" ? signOut() : signIn("github")
      }
      // className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      {status === "authenticated" ? "Sign out" : "Sign in"}
    </Button>
  );
};
