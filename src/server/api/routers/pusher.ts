import { string, z } from "zod";
import { pusher } from "~/utils/pusher";
import { setCORS } from "google-translate-api-browser";
const translate = setCORS("https://cors-anywhere.herokuapp.com/");
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
export const pusherRouter = createTRPCRouter({
  send: protectedProcedure
    .input(
      z.object({
        message: string(),
        roomName: string(),
        isFinal: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { message } = input;
      const { user } = ctx.session;
      const response = await pusher.trigger(
        input.roomName,
        "transcribe-event",
        {
          message,
          sender: user.name,
          isFinal: input.isFinal,
          senderId: user.id,
        }
      );
      const translated = await translate(message, {
        to: "en",
      });
      await ctx.prisma.room.update({
        where: {
          name: input.roomName,
        },
        data: {
          transcripts: {
            create: {
              text: translated.text,
              UserId: user.id,
            },
          },
        },
      });
      return response;
    }),
});
