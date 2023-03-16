import { string, z } from "zod";
import { AccessToken } from "livekit-server-sdk";
import type { AccessTokenOptions, VideoGrant } from "livekit-server-sdk";
const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = "5m";
  at.addGrant(grant);
  return at.toJwt();
};
const roomPattern = /\w{4}\-\w{4}/;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TokenResult } from "~/lib/type";

export const roomsRouter = createTRPCRouter({
  joinRoom: protectedProcedure
    .input(
      z.object({
        roomName: z.string(),
        metadata: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      if (!input.roomName.match(roomPattern)) {
        throw new Error("Invalid room name");
      }
      const identity = ctx.session.user.id;
      const name = ctx.session.user.name;

      const grant: VideoGrant = {
        room: input.roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      };
      const { roomName, metadata } = input;

      const token = createToken(
        { identity, name: name as string, metadata },
        grant
      );
      const result: TokenResult = {
        identity,
        accessToken: token,
      };
      const room = ctx.prisma.room.create({
        data: {
          name: input.roomName,
          Owner: {
            connect: {
              id: ctx.session.user.id,
            },
          },
          token: token,
          metadata: input.metadata,
        },
      });

      return result;
    }),
  createRoom: protectedProcedure.mutation(({ ctx }) => {
    const identity = ctx.session.user.id;
    const name = ctx.session.user.name;
    const roomName = Math.random().toString(36).substring(2, 6);
    const grant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    const token = createToken({ identity, name: name as string }, grant);
    const result: TokenResult = {
      identity,
      accessToken: token,
    };
    const room = ctx.prisma.room.create({
      data: {
        name: roomName,
        Owner: {
          connect: {
            id: ctx.session.user.id,
          },
        },
        token: token,
      },
    });
    return result;
  }),
});
