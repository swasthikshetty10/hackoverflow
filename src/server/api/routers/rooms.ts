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
const configuration = new Configuration({
  apiKey: process.env.OPEN_API_SECRET,
});
import { Configuration, OpenAIApi } from "openai";
const openai = new OpenAIApi(configuration);
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
  getRoomSummary: protectedProcedure
    .input(
      z.object({
        roomName: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      // order all transcripts by createdAt in ascending order
      const transcripts = await ctx.prisma.transcript.findMany({
        where: {
          Room: {
            name: input.roomName,
          },
        },
        include: {
          User: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      const chatLog = transcripts
        .map((transcript) => `${transcript.User.name} : ${transcript.text}`)
        .join("\n");
      const prompt = `generate a summarization of the transcript of a meeting conversation below in english:\n${chatLog}`;
      const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: prompt,
        temperature: 0.7,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 256,
      });
      console.log(completion);
      return completion;
    }),
});
