import { string, z } from "zod";
import { pusher } from "~/utils/pusher";
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
        }
      );
      return response;
    }),
});
