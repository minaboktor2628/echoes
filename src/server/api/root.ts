import { postRouter } from "@/server/api/routers/post";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/users";
import { profileRouter } from "@/server/api/routers/profile";
import { settingsRoute } from "@/server/api/routers/settings";
import { supportRoute } from "@/server/api/routers/support";

export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  profile: profileRouter,
  settings: settingsRoute,
  support: supportRoute,
});

// export type definition of API
export type AppRouter = typeof appRouter;
/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
