import { PrismaAdapter } from "@auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import { type Adapter } from "next-auth/adapters";
import DiscordProvider from "next-auth/providers/discord";
import { env } from "@/env";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { UserPreferences } from "@/types/settings";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      bio: string;
      blockedUserIds: string[];
      accountVisibility: "private" | "public";
      preferences: UserPreferences;
    } & DefaultSession["user"];
  }
  interface User {
    // ...other properties
    bio: string;
    blockedUserIds: string[];
    accountVisibility: "private" | "public";
    role: "user" | "admin";
    theme: "system" | "light" | "dark";
    mentionEmails: boolean;
    communicationEmails: boolean;
    marketingEmails: boolean;
    socialEmails: boolean;
    directMessageEmails: boolean;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, user }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          accountVisibility: user.accountVisibility,
          preferences: {
            theme: user.theme,
            blockedUserIds: user.blockedUserIds,
            mentionEmails: user.mentionEmails,
            communicationEmails: user.communicationEmails,
            marketingEmails: user.marketingEmails,
            socialEmails: user.socialEmails,
            directMessageEmails: user.directMessageEmails,
          },
          bio: user.bio,
          role: user.role,
        },
      };
    },
  },
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_ID,
      clientSecret: env.DISCORD_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
