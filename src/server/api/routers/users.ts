import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
export const userRouter = createTRPCRouter({
  getFriends: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        followers: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }
    return user.followers
      .filter((follower) => follower.name !== null)
      .map((follower) => ({
        id: follower.id,
        label: follower.name!,
      }));
  }),

  getAllUsers: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      // return testData
      //   .filter((user) =>
      //     user.display.toLowerCase().includes(input.toLowerCase()),
      //   )
      //   .slice(0, 10);

      return ctx.db.user
        .findMany({
          where: {
            name: {
              contains: input,
              mode: "insensitive",
            },
          },
          take: 10,
        })
        .then((users) =>
          users.map((user) => ({
            id: user.id,
            display: user.name!,
          })),
        );
    }),
});

const testData = [
  { id: "1", display: "Alice Johnson" },
  { id: "2", display: "Bob Smith" },
  { id: "3", display: "Charlie Brown" },
  { id: "4", display: "David Wilson" },
  { id: "5", display: "Eva Green" },
  { id: "6", display: "Frank Thomas" },
  { id: "7", display: "Grace Lee" },
  { id: "8", display: "Hannah White" },
  { id: "9", display: "Ian Black" },
  { id: "10", display: "Jackie Chan" },
  { id: "11", display: "Karen Taylor" },
  { id: "12", display: "Larry King" },
  { id: "13", display: "Monica Bell" },
  { id: "14", display: "Nathan Drake" },
  { id: "15", display: "Olivia Brown" },
  { id: "16", display: "Paul Walker" },
  { id: "17", display: "Quincy Adams" },
  { id: "18", display: "Rachel Green" },
  { id: "19", display: "Sam Wilson" },
  { id: "20", display: "Tina Turner" },
  { id: "21", display: "Uma Thurman" },
  { id: "22", display: "Victor Hugo" },
  { id: "23", display: "Wendy James" },
  { id: "24", display: "Xander Cage" },
  { id: "25", display: "Yara Grey" },
  { id: "26", display: "Zack Morris" },
  { id: "27", display: "Amy Pond" },
  { id: "28", display: "Bruce Wayne" },
  { id: "29", display: "Clark Kent" },
  { id: "30", display: "Diana Prince" },
  { id: "31", display: "Elliot Page" },
  { id: "32", display: "Fiona Apple" },
  { id: "33", display: "George Clooney" },
  { id: "34", display: "Helen Hunt" },
  { id: "35", display: "Iris West" },
  { id: "36", display: "Jake Gyllenhaal" },
  { id: "37", display: "Kurt Cobain" },
  { id: "38", display: "Liam Neeson" },
  { id: "39", display: "Mia Wallace" },
  { id: "40", display: "Neil Patrick Harris" },
  { id: "41", display: "Oscar Wilde" },
  { id: "42", display: "Penny Lane" },
  { id: "43", display: "Quentin Tarantino" },
  { id: "44", display: "Robin Hood" },
  { id: "45", display: "Sarah Connor" },
  { id: "46", display: "Tony Stark" },
  { id: "47", display: "Ursula Andress" },
  { id: "48", display: "Vin Diesel" },
  { id: "49", display: "Walter White" },
  { id: "50", display: "Xena Warrior" },
  { id: "51", display: "Yvonne Strahovski" },
  { id: "52", display: "Zoe Saldana" },
  { id: "53", display: "Ariel Little" },
  { id: "54", display: "Ben Affleck" },
  { id: "55", display: "Carrie Fisher" },
  { id: "56", display: "Drew Barrymore" },
  { id: "57", display: "Elton John" },
  { id: "58", display: "Freddie Mercury" },
  { id: "59", display: "Gwen Stefani" },
  { id: "60", display: "Hugh Jackman" },
  { id: "61", display: "Isla Fisher" },
  { id: "62", display: "Jude Law" },
  { id: "63", display: "Kate Winslet" },
  { id: "64", display: "Leonardo DiCaprio" },
  { id: "65", display: "Matt Damon" },
  { id: "66", display: "Natalie Portman" },
  { id: "67", display: "Oprah Winfrey" },
  { id: "68", display: "Patrick Stewart" },
  { id: "69", display: "Quinn Hughes" },
  { id: "70", display: "Robert Downey Jr." },
  { id: "71", display: "Scarlett Johansson" },
  { id: "72", display: "Tom Hanks" },
  { id: "73", display: "Uma Thurman" },
  { id: "74", display: "Vin Diesel" },
  { id: "75", display: "Winona Ryder" },
  { id: "76", display: "Xander Berkeley" },
  { id: "77", display: "Yvonne De Carlo" },
  { id: "78", display: "Zachary Quinto" },
  { id: "79", display: "Adele Laurie" },
  { id: "80", display: "Bruce Banner" },
  { id: "81", display: "Clark Gregg" },
  { id: "82", display: "Daisy Ridley" },
  { id: "83", display: "Emma Stone" },
  { id: "84", display: "Finn Jones" },
  { id: "85", display: "Gal Gadot" },
  { id: "86", display: "Henry Cavill" },
  { id: "87", display: "Idris Elba" },
  { id: "88", display: "Jennifer Lawrence" },
  { id: "89", display: "Keanu Reeves" },
  { id: "90", display: "Laura Dern" },
  { id: "91", display: "Mark Ruffalo" },
  { id: "92", display: "Natalie Dormer" },
  { id: "93", display: "Olivia Wilde" },
  { id: "94", display: "Paul Rudd" },
  { id: "95", display: "Quincy Jones" },
  { id: "96", display: "Ryan Reynolds" },
  { id: "97", display: "Sophia Bush" },
  { id: "98", display: "Tessa Thompson" },
  { id: "99", display: "Uma Thurman" },
  { id: "100", display: "Vin Diesel" },
];
