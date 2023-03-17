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
      ctx.prisma.room.update({
        where: {
          name: input.roomName,
        },
        data: {
          transcripts: {
            create: {
              text: message,
              UserId: user.id,
            },
          },
        },
      });
      return response;
    }),
});
