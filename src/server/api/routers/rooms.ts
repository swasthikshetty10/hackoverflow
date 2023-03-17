import { string, z } from "zod";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";
import type {
  AccessTokenOptions,
  VideoGrant,
  CreateOptions,
} from "livekit-server-sdk";
import { translate } from "@vitalets/google-translate-api";

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.ttl = "5m";
  at.addGrant(grant);
  return at.toJwt();
};
import axios from "axios";

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
    .query(async ({ input, ctx }) => {
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
        // check if user is already in room
        console.log("here");
        const participant = await ctx.prisma.participant.findUnique({
          where: {
            UserId_RoomName: {
              UserId: ctx.session.user.id,
              RoomName: roomName,
            },
          },
        });
        if (participant === null)
          await ctx.prisma.participant.create({
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
                UserId: ctx.session.user.id,
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
      const chatLog = transcripts.map((transcript) => ({
        speaker: transcript.User.name,
        utterance: transcript.text,
        timestamp: transcript.createdAt.toISOString(),
      }));
      if (chatLog.length === 0) {
        return {
          summary: "No summary available",
          topics: [],
          emotions: [],
          numbers: [],
          names: [],
        };
      }

      const apiKey = process.env.ONEAI_API_KEY;
      console.log(chatLog);
      try {
        const config = {
          method: "POST",
          url: "https://api.oneai.com/api/v0/pipeline",
          headers: {
            "api-key": apiKey,
            "Content-Type": "application/json",
          },
          data: {
            input: chatLog,
            input_type: "conversation",
            content_type: "application/json",
            output_type: "json",
            multilingual: {
              enabled: true,
            },
            steps: [
              {
                skill: "article-topics",
              },
              {
                skill: "numbers",
              },
              {
                skill: "names",
              },
              {
                skill: "emotions",
              },
              {
                skill: "summarize",
              },
            ],
          },
        };

        const res = await axios.request(config);
        console.log(res.status);
        return res.data;
      } catch (error) {
        console.log(error);
      }
    }),
});
