import { string, z } from "zod";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import type {
  AccessTokenOptions,
  VideoGrant,
  CreateOptions,
} from "livekit-server-sdk";

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = "5m";
  at.addGrant(grant);
  return at.toJwt();
};
const roomPattern = /\w{4}\-\w{4}/;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const apiHost = process.env.NEXT_PUBLIC_LIVEKIT_API_HOST as string;
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { TokenResult } from "~/lib/type";
import { CreateRoomRequest } from "livekit-server-sdk/dist/proto/livekit_room";
const roomClient = new RoomServiceClient(apiHost, apiKey, apiSecret);
export const roomsRouter = createTRPCRouter({
  joinRoom: protectedProcedure
    .input(
      z.object({
        roomName: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const identity = ctx.session.user.id;
      const name = ctx.session.user.name;

      const grant: VideoGrant = {
        room: input.roomName,
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      };
      const { roomName } = input;

      const token = createToken({ identity, name: name as string }, grant);
      const result: TokenResult = {
        identity,
        accessToken: token,
      };
      try {
        ctx.prisma.participant.create({
          data: {
            User: {
              connect: {
                id: ctx.session.user.id,
              },
            },
            Room: {
              connect: {
                name: roomName,
              },
            },
          },
        });
      } catch (error) {
        console.log(error);
      }

      return result;
    }),
  createRoom: protectedProcedure.mutation(async ({ ctx }) => {
    const identity = ctx.session.user.id;
    const name = ctx.session.user.name;
    const room = await ctx.prisma.room.create({
      data: {
        Owner: {
          connect: {
            id: ctx.session.user.id,
          },
        },
      },
    });
    await roomClient.createRoom({
      name: room.name,
    });

    const grant: VideoGrant = {
      room: room.name,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    };
    const token = createToken({ identity, name: name as string }, grant);
    const result = {
      roomName: room.name,
    };

    return result;
  }),
  getRoomsByUser: protectedProcedure.query(async ({ ctx }) => {
    const rooms = await ctx.prisma.room.findMany({
      where: {
        OR: [
          {
            Owner: {
              id: ctx.session.user.id,
            },
          },
          {
            Participant: {
              some: {
                User: {
                  id: ctx.session.user.id,
                },
              },
            },
          },
        ],
      },
    });

    return rooms;
  }),
});
