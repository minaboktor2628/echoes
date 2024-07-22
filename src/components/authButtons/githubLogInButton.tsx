"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export const GithubLogInButton = () => {
  const { status } = useSession();

  return (
    <Button
      onClick={() =>
        status === "authenticated" ? signOut() : signIn("github")
      }
    >
      {status === "authenticated" ? "Sign out" : "Sign in"}
    </Button>
  );
};
